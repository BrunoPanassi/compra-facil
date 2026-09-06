import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { PgDialect } from 'drizzle-orm/pg-core';
import { paginationFilter, searchableProperties } from '../server/database/queries/pagination';
import { normalizePagination } from '../server/utils/pagination';
import { ProductRepository } from '../server/repositories/ProductRepository';
import { ProductStoreRepository } from '../server/repositories/ProductStoreRepository';
import { useRuntimeConfig } from './runtime';
import type { Product } from '../types/Product';

const statements: { text: string; values: unknown[] }[] = [];
let resultRows: unknown[][] = [];
const db = drizzle({ query: async (query: { text: string }, values: unknown[]) => {
  statements.push({ text: query.text, values });
  return { rows: query.text.includes('count(') ? [[3]] : resultRows };
} } as unknown as import('pg').Pool);
Object.assign(globalThis, { compraFacilDatabase: db, useRuntimeConfig });
const dialect = new PgDialect();

test('pagination normalization rejects invalid and unsafe input', () => {
  assert.deepEqual(normalizePagination({ prop: 'name' }), { page: 1, perPage: 10, search: '', prop: 'name', offset: 0 });
  for (const value of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => normalizePagination({ prop: 'name', page: value }));
    assert.throws(() => normalizePagination({ prop: 'name', perPage: value }));
  }
});

test('all whitelisted properties are parameterized with literal partial search', () => {
  for (const [entity, props] of Object.entries(searchableProperties)) {
    for (const prop of props) {
      const filter = paginationFilter(entity, prop, "A%_\\' OR 1=1");
      assert.ok(filter);
      const query = dialect.sqlToQuery(filter);
      assert.match(query.sql, /strpos\(lower/);
      assert.deepEqual(query.params, ["a%_\\' or 1=1"]);
      assert.ok(!query.sql.includes('OR 1=1'));
    }
    assert.equal(paginationFilter(entity, 'name', ''), undefined);
    assert.equal(dialect.sqlToQuery(paginationFilter(entity, '__proto__', 'x')!).sql, 'false');
    assert.deepEqual(dialect.sqlToQuery(paginationFilter(entity, props[0], ' ')!).params, [' ']);
  }
});

test('SQL repositories never use getAll; count and page share filter and stable order', async () => {
  for (const repo of [new ProductRepository(true), new ProductStoreRepository(true)]) {
    repo.getAll = async () => { throw Error('getAll forbidden'); };
    for (const search of ['', 'Ab', '%']) {
      statements.length = 0;
      const result = await repo.getPaginated({ prop: 'id', search, page: 2, perPage: 2 });
      assert.deepEqual(result, { items: [], total: 3 });
      assert.equal(statements.length, 2);
      const [count, page] = statements;
      assert.match(count.text, /count\(/);
      assert.match(page.text, /order by .*"id" asc limit .* offset/);
      assert.deepEqual(page.values.slice(-2), [2, 2]);
      assert.deepEqual(count.values, page.values.slice(0, -2));
    }
  }
});

test('store JOIN preserves association and product fields in one filtered query', async () => {
  const repo = new ProductStoreRepository(true);
  repo.getAll = async () => { throw Error('getAll forbidden'); };
  statements.length = 0;
  resultRows = [[7, 2, 3, '12.50', 4, 3, 'Arroz', 'Marca', null, 1, ['img']]];
  const rows = await repo.getByStore(2);
  assert.equal(statements.length, 1);
  assert.match(statements[0].text, /inner join "products" on .* where "product_stores"\."id_store" = \$1/);
  assert.deepEqual(statements[0].values, [2]);
  assert.deepEqual(rows[0], { id: 7, id_store: 2, id_product: 3, price: '12.50', quantity: 4,
    product: { id: 3, name: 'Arroz', brand: 'Marca', desc: undefined, material_id: 1, images: ['img'] } });
  resultRows = [];
  assert.deepEqual(await repo.getByStore(999), []);
  statements.length = 0;
  for (const id of [0, -1, NaN, 1.2, Infinity, 2147483648]) await assert.rejects(repo.getByStore(id));
  assert.equal(statements.length, 0);
});

test('JSONBin pagination and enriched store response remain compatible', async () => {
  const products: Product[] = [
    { id: 1, name: 'Arroz Branco', brand: 'A', material_id: 1, images: ['a', 'b'] },
    { id: 2, name: 'Arroz Integral', brand: 'B', material_id: 2, images: [] },
    { id: 3, name: 'Feijao', brand: 'C', material_id: 1, images: [] },
  ];
  Object.assign(globalThis, { $fetch: async (url: string) => ({ record: url.includes('691258eed0ea881f40e06d73') ? products : [
    { id: 7, id_store: 2, id_product: 1, price: '12.50', quantity: 4 },
    { id: 8, id_store: 3, id_product: 2, price: '8.00', quantity: 1 },
  ] }) });
  const repo = new ProductRepository(false);
  assert.equal((await repo.getPaginated({ prop: 'name', search: 'ARROZ', page: 2, perPage: 1 })).items[0].id, 2);
  assert.equal((await repo.getPaginated({ prop: 'name', search: 'Arroz' })).total, 2);
  assert.equal((await repo.getPaginated({ prop: 'name', search: '', page: 9 })).items.length, 0);
  for (const [prop, search] of [['id', '1'], ['brand', 'A'], ['material_id', '1'], ['images', 'a,b'], ['name', 'branco']])
    assert.ok((await repo.getPaginated({ prop, search })).total > 0);
  assert.equal((await repo.getPaginated({ prop: 'invalid', search: 'x' })).total, 0);
  const associations = new ProductStoreRepository(false);
  assert.deepEqual(await associations.getByStore(2), [{ id: 7, id_store: 2, id_product: 1, price: '12.50', quantity: 4, product: products[0] }]);
  assert.deepEqual(await associations.getByStore(999), []);
});

test('store selection consumes one enriched request and guards stale responses', () => {
  const source = readFileSync(new URL('../components/ProductCard.vue', import.meta.url), 'utf8');
  const handler = source.split('async function onStoreSelect()')[1].split('function setFormOnProductValues')[0];
  assert.equal((handler.match(/await /g) || []).length, 1);
  assert.ok(!handler.includes('productStore.fetch'));
  assert.match(handler, /request === storeRequest/);
});
