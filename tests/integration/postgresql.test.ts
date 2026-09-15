import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { SqlAdapter } from '../../server/adapters/SqlAdapter';
import { getProductStoresByStore } from '../../server/database/queries/product-store';
import type { MaterialType } from '../../types/MaterialType';

const connectionString = process.env.TEST_DATABASE_URL;
// Explicit opt-in, local only. Every fixture is rolled back, including failing writes.
test('PostgreSQL CRUD, pagination, JOIN, constraints and rollback', { skip: !connectionString }, async () => {
  const url = new URL(connectionString!);
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname));
  assert.notEqual(process.env.NODE_ENV, 'production');
  assert.ok(!process.env.VERCEL);
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();
  const marker = `step4-test-${Date.now()}`;
  try {
    await client.query('BEGIN');
    Object.assign(globalThis, { compraFacilDatabase: drizzle(client) });
    const adapter = new SqlAdapter<MaterialType>('material-types');
    const item: MaterialType = { id: 0, name: marker };
    await adapter.add(item);
    assert.ok(item.id > 0);
    assert.equal((await adapter.getById(item.id))?.name, marker);
    assert.ok((await adapter.getAll()).some(row => row.id === item.id));
    assert.deepEqual(await adapter.getByIds([item.id]), [item]);
    assert.deepEqual(await adapter.getByIds([]), []);
    const sibling: MaterialType = { id: 0, name: `${marker}-sibling` };
    await adapter.add(sibling);
    assert.equal((await adapter.update(item.id, { name: `${marker}-updated` }))?.name, `${marker}-updated`);
    assert.equal((await adapter.getById(sibling.id))?.name, sibling.name);
    assert.equal(await adapter.delete(sibling.id), true);
    assert.ok(await adapter.getById(item.id));
    assert.equal(await adapter.getById(sibling.id), undefined);
    const user = await client.query('INSERT INTO users (nome, telefone, senha, role) VALUES ($1,$2,$3,$4) RETURNING id', [marker, marker, 'test-only', 'CLIENT']);
    const store = await client.query('INSERT INTO stores (name,street,nr,neighbr,city,state,zip,lat,lon,owner_id,cellphone) VALUES ($1,$1,1,$1,$1,$1,$2,0,0,$3,$2) RETURNING id', [marker, '01234567', user.rows[0].id]);
    assert.deepEqual(await getProductStoresByStore(store.rows[0].id), []);
    const material = await client.query('INSERT INTO materials (name,type_id) VALUES ($1,$2) RETURNING id', [marker, item.id]);
    const product = await client.query('INSERT INTO products (name,brand,material_id,images) VALUES ($1,$1,$2,$3) RETURNING id', [marker, material.rows[0].id, ['test-image']]);
    const args = [store.rows[0].id, product.rows[0].id, '12.50', 4];
    const insert = 'INSERT INTO product_stores (id_store,id_product,price,quantity) VALUES ($1,$2,$3,$4)';
    await client.query(insert, args);
    const joined = await getProductStoresByStore(store.rows[0].id);
    assert.equal(joined.length, 1); assert.equal(joined[0].product.name, marker);
    assert.equal(joined[0].price, '12.50'); assert.equal(joined[0].quantity, 4);
    const products = new SqlAdapter<{ id: number; name: string }>('products');
    const page = await products.getPaginated({ prop: 'name', search: marker, page: 1, perPage: 1 });
    assert.equal(page.total, 1); assert.equal(page.items[0].id, product.rows[0].id);
    assert.equal((await products.getPaginated({ prop: 'name', search: marker, page: 2, perPage: 1 })).items.length, 0);
    for (const [query, values, code] of [
      [insert, args, '23505'],
      [insert, [store.rows[0].id, 2147483647, '12.50', 1], '23503'],
    ] as const) {
      await client.query('SAVEPOINT failing_write');
      await assert.rejects(client.query(query, [...values]), { code });
      await client.query('ROLLBACK TO SAVEPOINT failing_write');
    }
    await client.query('ROLLBACK');
    assert.equal((await client.query('SELECT id FROM material_types WHERE name = $1', [`${marker}-updated`])).rowCount, 0);
    assert.equal((await client.query('SELECT id FROM users WHERE nome = $1', [marker])).rowCount, 0);
  } finally {
    try { await client.query('ROLLBACK'); }
    finally {
      Reflect.deleteProperty(globalThis, 'compraFacilDatabase');
      client.release();
      await pool.end();
    }
  }
});
