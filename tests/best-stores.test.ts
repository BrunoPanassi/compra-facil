import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Pool } from 'pg';
import { createApp, createRouter, toWebHandler } from 'h3';
import bestStoresRoute from '../server/api/store/best.post';
import { apiHandler } from '../server/utils/api-handler';
import { drizzle } from 'drizzle-orm/node-postgres';
import { PgDialect } from 'drizzle-orm/pg-core';
import { createPinia, defineStore, setActivePinia } from 'pinia';
import { validateBestStoreSearch } from '../server/utils/best-store-validation';
import { bestStoresStatement, findBestStores } from '../server/database/queries/best-stores';
import { StoreRepository } from '../server/repositories/StoreRepository';
import { StoreService } from '../server/services/StoreService';
import type { BestStoreQueryParams, BestStoreResult } from '../types/BestStore';

const params: BestStoreQueryParams = {
  products: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }],
  latitude: 0, longitude: 0, priority: 'price', priceWeight: 0.6, distanceWeight: 0.4, maxDistanceKm: 20
};

test('best store validation accepts boundaries and rejects invalid requests', () => {
  assert.equal(validateBestStoreSearch(params).products[0].quantity, 2);
  for (const body of [null, [], {}, { ...params, products: [] },
    { ...params, products: Array(101).fill({ productId: 1, quantity: 1 }) },
    { ...params, products: [params.products[0], params.products[0]] },
    ...[NaN, Infinity, -91, 91, '0', null].map(latitude => ({ ...params, latitude })),
    ...[NaN, Infinity, -181, 181, '0'].map(longitude => ({ ...params, longitude })),
    { ...params, priority: 'other' },
    ...[0, -1, 1.5, NaN, Infinity, 2147483648, '1'].flatMap(value => [
      { ...params, products: [{ productId: value, quantity: 1 }] },
      { ...params, products: [{ productId: 1, quantity: value }] },
    ]),
  ]) assert.throws(() => validateBestStoreSearch(body), { statusCode: 400 });
  assert.equal(validateBestStoreSearch({ ...params, latitude: -90, longitude: 180,
    products: [{ productId: 2147483647, quantity: 2147483647 }] }).latitude, -90);
});

test('ranking parameters are bound, SQL adapter is required, service defines weights', async () => {
  const statement = new PgDialect().sqlToQuery(bestStoresStatement(params));
  assert.ok(!statement.sql.includes(JSON.stringify(params.products)));
  assert.equal(statement.params[0], JSON.stringify(params.products));
  assert.match(statement.sql, /LIMIT 3/);
  await assert.rejects(new StoreRepository(false).findBestStores(params), { statusCode: 503 });
  const repo = new StoreRepository(true);
  repo.findBestStores = async input => {
    assert.equal(input.priceWeight, input.priority === 'price' ? 0.6 : 0.4);
    assert.equal(input.distanceWeight, input.priority === 'distance' ? 0.6 : 0.4);
    return [];
  };
  const service = new StoreService(repo);
  await service.findBestStores(params);
  await service.findBestStores({ ...params, priority: 'distance' });
});

test('H3 search route uses its own validation and preserves CRUD validation', async () => {
  const previous = StoreService.prototype.findBestStores;
  StoreService.prototype.findBestStores = async input => {
    assert.deepEqual(input.products, params.products);
    return [];
  };
  try {
    const app = createApp({ debug: false });
    const router = createRouter();
    router.post('/api/store/best', bestStoresRoute);
    router.post('/api/store', apiHandler(() => ({ created: true })));
    app.use(router);
    const handler = toWebHandler(app);
    const send = (path: string, body: unknown) => handler(new Request(`http://localhost${path}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    }));
    assert.equal((await send('/api/store/best', params)).status, 200);
    assert.equal((await send('/api/store/best', { ...params, products: [] })).status, 400);
    assert.equal((await send('/api/store', params)).status, 400);
    StoreService.prototype.findBestStores = async () => { throw Error('secret database connection'); };
    const failed = await send('/api/store/best', params);
    assert.equal(failed.status, 503);
    assert.ok(!(await failed.text()).includes('secret'));
  } finally { StoreService.prototype.findBestStores = previous; }
});

test('Pinia ignores obsolete responses and errors, clears results and controls loading', async () => {
  Object.assign(globalThis, { defineStore });
  const { useStoreStore } = await import('../stores/store');
  setActivePinia(createPinia());
  const store = useStoreStore();
  const pending: { resolve: (value: BestStoreResult[]) => void; reject: (error: Error) => void }[] = [];
  const previousFetch = Reflect.get(globalThis, '$fetch');
  Object.assign(globalThis, { $fetch: () => new Promise<BestStoreResult[]>((resolve, reject) => pending.push({ resolve, reject })) });
  try {
    const first = store.fetchBestStores(params);
    const second = store.fetchBestStores(params);
    pending[1].resolve([{ coverage: 2 } as BestStoreResult]);
    await second;
    pending[0].resolve([]);
    assert.equal(await first, undefined);
    assert.equal(store.bestStores.length, 1);
    assert.equal(store.bestStoresLoading, false);
    const third = store.fetchBestStores(params);
    assert.deepEqual(store.bestStores, []);
    assert.equal(store.bestStoresLoading, true);
    pending[2].reject(Error('private details'));
    await third;
    assert.ok(store.bestStoresError);
    assert.equal(store.bestStoresLoading, false);
    const fourth = store.fetchBestStores(params);
    const fifth = store.fetchBestStores(params);
    pending[3].reject(Error('stale'));
    await fourth;
    assert.equal(store.bestStoresError, '');
    assert.equal(store.bestStoresLoading, true);
    pending[4].resolve([]);
    await fifth;
    assert.deepEqual(store.bestStores, []);
  } finally { Object.assign(globalThis, { $fetch: previousFetch }); }
});

// Explicit local opt-in. Temporary tables shadow real tables; all fixtures roll back.
test('real PostgreSQL ranking, inventory, decimals, distances, details and execution plan', {
  skip: !process.env.TEST_DATABASE_URL,
}, async () => {
  const connectionString = process.env.TEST_DATABASE_URL!;
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(connectionString).hostname));
  assert.notEqual(process.env.NODE_ENV, 'production');
  assert.ok(!process.env.VERCEL);
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();
  const previousDb = Reflect.get(globalThis, 'compraFacilDatabase');
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TEMP TABLE stores (
      id integer PRIMARY KEY, name text DEFAULT 'Loja', street text DEFAULT '', nr integer DEFAULT 1,
      neighbr text DEFAULT '', city text DEFAULT '', state text DEFAULT '', zip text DEFAULT '',
      lat numeric DEFAULT 0, lon numeric DEFAULT 0, owner_id integer DEFAULT 1,
      description text, cellphone text, cellphone_second text, email text,
      facebook text, instagram text, another text
    ) ON COMMIT DROP;
    CREATE TEMP TABLE products (id integer PRIMARY KEY, name text, brand text DEFAULT '',
      "desc" text, material_id integer DEFAULT 1, images text[] DEFAULT '{}') ON COMMIT DROP;
    CREATE TEMP TABLE product_stores (id_store integer, id_product integer, price numeric(12,2), quantity integer,
      UNIQUE(id_store,id_product)) ON COMMIT DROP;
    CREATE INDEX ON product_stores(id_product);
    CREATE INDEX ON product_stores(id_store);`);
    let statements = 0;
    Object.assign(globalThis, { compraFacilDatabase: drizzle(client, { logger: { logQuery() { statements++; } } }) });
    assert.deepEqual(await findBestStores(params), []);
    await client.query("INSERT INTO products(id,name) VALUES (1,'A'),(2,'B'),(3,'C')");
    await client.query('INSERT INTO stores(id,lon) VALUES (1,0),(2,0.02),(3,0.025),(4,0.03),(5,0)');
    await client.query(`INSERT INTO product_stores VALUES
      (1,1,10.10,2),(1,2,3.30,1),
      (2,1,1.10,2),(2,2,0.10,1),
      (3,1,1.10,2),(3,2,0.10,1),
      (4,1,1.10,2),(4,2,0.10,1),
      (5,1,0,1),(5,2,0,0)`);
    statements = 0;
    const price = await findBestStores(params);
    assert.equal(statements, 1, 'one batched statement, no N+1');
    assert.deepEqual(price.map(r => r.store.id), [2, 3, 4]);
    assert.equal(price[0].totalPrice, 2.3);
    assert.equal(price[0].coverage, 2);
    assert.equal(price[0].foundProducts[0].subtotal, '2.20');
    assert.equal(price[0].foundProducts[0].price, '1.10');
    assert.equal(price[0].foundProducts[0].quantity, 2);
    assert.equal(price[0].foundProducts[0].availableQuantity, 2);
    assert.ok(Math.abs(price[0].distance - 2.2239016) < 0.00001);
    assert.notEqual(price[0].foundProducts, price[1].foundProducts);
    const distance = await findBestStores({ ...params, priority: 'distance', priceWeight: 0.4, distanceWeight: 0.6 });
    assert.equal(distance[0].store.id, 1);
    assert.equal(distance[0].distance, 0);
    assert.equal(distance[0].totalPrice, 23.5);
    const insufficient = await findBestStores({ ...params, products: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 2 }] });
    assert.equal(insufficient[0].coverage, 1);
    assert.equal(insufficient[0].missingProducts[0].availableQuantity, 1);
    assert.equal(insufficient[0].missingProducts[0].requestedQuantity, 2);
    const partial = await findBestStores({ ...params, products: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }, { productId: 999, quantity: 1 }] });
    assert.equal(partial[0].coverage, 1);
    assert.deepEqual(partial[0].missingProducts.map(p => p.id), [3, 999]);
    assert.equal(partial[0].requestedCount, 3);
    assert.deepEqual(await findBestStores({ ...params, products: [{ productId: 999, quantity: 1 }] }), []);
    assert.deepEqual(await findBestStores({ ...params, products: [{ productId: 1, quantity: 3 }] }), []);
    assert.deepEqual(await findBestStores({ ...params, products: [] }), []);
    await client.query('UPDATE product_stores SET price=0; UPDATE stores SET lon=0');
    const zero = await findBestStores(params);
    assert.deepEqual(zero.map(r => r.store.id), [1, 2, 3]);
    assert.ok(zero.every(r => r.score === 0 && r.distance === 0 && r.totalPrice === 0));
    const compiled = new PgDialect().sqlToQuery(bestStoresStatement(params));
    const plan = await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${compiled.sql}`, compiled.params);
    assert.ok(plan.rows[0]['QUERY PLAN'][0]['Execution Time'] >= 0);
    console.info('Best stores temporary fixture plan:', JSON.stringify(plan.rows[0]['QUERY PLAN']));
  } finally {
    await client.query('ROLLBACK');
    if (previousDb) Object.assign(globalThis, { compraFacilDatabase: previousDb });
    else Reflect.deleteProperty(globalThis, 'compraFacilDatabase');
    client.release();
    await pool.end();
  }
});
