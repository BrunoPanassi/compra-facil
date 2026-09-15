import 'dotenv/config';
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const origin = process.env.SMOKE_ORIGIN || 'http://127.0.0.1:3100';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname));
const unavailable = process.argv.includes('--unavailable');
const request = async (path: string, init?: RequestInit) => {
  const response = await fetch(origin + path, init);
  const body: unknown = await response.json();
  assert.ok(!/"(?:password|senha|hash|passwordHash|stack)"\s*:|postgresql:\/\/|SELECT .* FROM/i.test(JSON.stringify(body)), 'Public response contains private fields.');
  return { response, body };
};
if (unavailable) {
  for (const path of ['/api/health', '/api/product']) {
    const { response } = await request(path);
    assert.equal(response.status, 503);
  }
  console.info('Unavailable database: health/API controlled 503; no JSONBin fallback.');
} else {
  const html = await fetch(origin);
  assert.equal(html.status, 200);
  const source = await html.text();
  assert.match(source, /id="__nuxt"/);
  const asset = source.match(/(?:src|href)="([^" ]*\/_nuxt\/[^" ]+\.js)"/);
  assert.ok(asset);
  assert.equal((await fetch(new URL(asset[1], origin))).status, 200);
  assert.equal((await request('/api/health')).response.status, 200);
  for (const path of ['/api/product', '/api/store', '/api/product?prop=name&search=demo&page=1&perPage=2', '/api/product-store/store?store_id=2147483647']) {
    assert.equal((await request(path)).response.status, 200);
  }
  for (const path of ['/api/product?id=invalid', '/api/product?page=0', '/api/product?perPage=101']) {
    assert.equal((await request(path)).response.status, 400);
  }
  const marker = `step4-smoke-${Date.now()}`;
  let fixtureId: number | undefined;
  const connectionString = process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL;
  assert.ok(connectionString);
  assert.ok(['localhost', '127.0.0.1'].includes(new URL(connectionString).hostname));
  const pool = new Pool({ connectionString, max: 1 });
  const counts = () => pool.query(`SELECT
    (SELECT count(*)::int FROM users) AS users,
    (SELECT count(*)::int FROM material_types) AS material_types,
    (SELECT count(*)::int FROM materials) AS materials,
    (SELECT count(*)::int FROM products) AS products,
    (SELECT count(*)::int FROM stores) AS stores,
    (SELECT count(*)::int FROM product_stores) AS product_stores`);
  const before = (await counts()).rows[0];
  let userId: number | undefined;
  try {
    const created = await request('/api/material-type', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: marker }) });
    assert.equal(created.response.status, 200);
    assert.ok(created.body && typeof created.body === 'object' && 'id' in created.body && typeof created.body.id === 'number');
    fixtureId = created.body.id;
    assert.equal((await request(`/api/material-type/${fixtureId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${marker}-updated` }) })).response.status, 200);
    const senha = 'step4-test-password';
    const telefone = `119${String(Date.now()).slice(-8)}`;
    const inserted = await pool.query('INSERT INTO users (nome,telefone,senha,role) VALUES ($1,$2,$3,$4) RETURNING id', [marker, telefone, await bcrypt.hash(senha, 10), 'CLIENT']);
    userId = inserted.rows[0].id;
    const login = await request('/api/user/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ telefone, senha }) });
    assert.equal(login.response.status, 200);
    assert.ok(login.body && typeof login.body === 'object' && 'id' in login.body && login.body.id === userId);
    assert.equal((await request('/api/user/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ telefone, senha: 'wrong-password' }) })).response.status, 401);
    console.info('Preview: SSR, asset, health, APIs, search, pagination, empty JOIN, CRUD fixture and sanitized login passed.');
  } finally {
    if (fixtureId) {
      const removed = await fetch(`${origin}/api/material-type/${fixtureId}`, { method: 'DELETE' });
      assert.ok(removed.ok);
      assert.equal((await pool.query('SELECT id FROM material_types WHERE id=$1 AND name=$2', [fixtureId, `${marker}-updated`])).rowCount, 0);
    }
    if (userId) await pool.query('DELETE FROM users WHERE id=$1 AND nome=$2', [userId, marker]);
    assert.deepEqual((await counts()).rows[0], before);
    await pool.end();
  }
}
