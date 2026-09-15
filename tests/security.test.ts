import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isSqlEnabled } from '../server/utils/adapter';
import { publicUser } from '../server/utils/public-user';
import { publicError } from '../server/utils/public-error';
import { validId, queryIds, validatePayload } from '../server/utils/validation';
import { normalizePagination } from '../server/utils/pagination';
import { getEntityMapping } from '../server/database/entity-map';
import { poolOptions } from '../server/database/pool-options';
import { assertDevelopmentSeed } from '../server/database/seeds/guard';
import { EnumRole } from '../types/Role';

test('adapter configuration has an explicit JSONBin default', () => {
  for (const value of [true, 'true']) assert.equal(isSqlEnabled(value), true);
  for (const value of [false, 'false', undefined]) assert.equal(isSqlEnabled(value), false);
});
test('public users include only allowed fields without mutating the stored hash', () => {
  const user = { id: 1, nome: 'Teste', telefone: '01199999999', senha: 'secret', role: EnumRole.CLIENT,
    password: 'secret', hash: 'secret', passwordHash: 'secret', token: 'secret' };
  assert.deepEqual(publicUser(user), { id: 1, nome: 'Teste', telefone: '01199999999', role: EnumRole.CLIENT });
  assert.equal(user.senha, 'secret');
});
test('public errors discard SQL, URLs, credentials, causes and stacks', () => {
  for (const statusCode of [400, 401, 409, 500, undefined]) {
    const error = publicError({ statusCode, message: 'SELECT senha FROM users postgresql://user:password@host/db', stack: 'secret', data: { password: 'secret' } });
    const result = JSON.stringify(error);
    assert.doesNotMatch(result, /SELECT|postgresql|password|secret|users/);
    assert.equal(error.statusCode, statusCode && statusCode < 500 ? statusCode : 503);
  }
});
test('pagination has bounded pages, page size and search', () => {
  assert.equal(normalizePagination({ prop: 'name', search: '' }).search, '');
  for (const perPage of [0, -1, 101, 1.5]) assert.throws(() => normalizePagination({ prop: 'name', perPage }));
  assert.throws(() => normalizePagination({ prop: 'name', page: 0 }));
  assert.throws(() => normalizePagination({ prop: 'name', search: 'x'.repeat(201) }));
});
test('IDs reject coercion and preserve bounded numeric IDs', () => {
  assert.equal(validId('12'), 12);
  assert.deepEqual(queryIds(['1', '2']), [1, 2]);
  for (const value of [true, null, '', '1x', '1.5', [], 0, -1, 2147483648]) assert.throws(() => validId(value));
});
test('write validation rejects mass assignment and invalid scalar representations', () => {
  validatePayload('product-store', { id_store: 1, id_product: 2, price: '12.50', quantity: 0 });
  for (const values of [{ price: '-1' }, { price: '1.234' }, { quantity: 1.2 }, { quantity: -1 }, { password: 'x' }]) {
    assert.throws(() => validatePayload('product-store', values, true));
  }
  for (const values of [{ zip: 12345678 }, { cellphone: 11999999999 }]) assert.throws(() => validatePayload('store', values, true));
  validatePayload('store', { zip: '01234567', cellphone: '01199999999' }, true);
  assert.throws(() => validatePayload('register', { nome: 'X', telefone: '11999999999', senha: 'test-only', role: 'ADMIN' }));
});
test('SQL serialization preserves decimal, array and textual contact contracts', () => {
  const store = getEntityMapping('stores').fromDatabase({ id: 2, zip: '01234567', cellphone: '01199999999', lat: '1.2', lon: '2.3', ownerId: 1 });
  assert.equal(store.email, '');
  assert.equal(getEntityMapping('products').fromDatabase({ id: 1, desc: null }).desc, undefined);
  assert.equal(getEntityMapping('materials').fromDatabase({ id: 1, weight: null }).weight, null);
  assert.equal(typeof store.id, 'number'); assert.equal(store.zip, '01234567'); assert.equal(store.cellphone, '01199999999');
  const association = getEntityMapping('product-store').fromDatabase({ id: 3, idStore: 2, idProduct: 1, price: '12.50', quantity: 4 });
  assert.equal(association.price, '12.50'); assert.ok(Number.isInteger(association.quantity));
  assert.deepEqual(getEntityMapping('products').fromDatabase({ id: 1, images: ['x'] }).images, ['x']);
});
test('pool configuration is conservative, private and verifies SSL', () => {
  const config = poolOptions({ DATABASE_URL: 'postgresql://user:password@localhost/test', DATABASE_SSL: 'true' });
  assert.equal(config.max, 3); assert.equal(config.connectionTimeoutMillis, 5000);
  assert.deepEqual(config.ssl, { rejectUnauthorized: true });
  assert.throws(() => poolOptions({}));
  assert.throws(() => poolOptions({ DATABASE_URL: 'postgresql://localhost/test', DATABASE_POOL_MAX: '0' }));
  assert.throws(() => poolOptions({ DATABASE_URL: 'postgresql://localhost/test', VERCEL: '1' }));
});
test('seed refuses production, Vercel, missing environment and remote hosts', () => {
  const local = { NODE_ENV: 'development', DATABASE_URL: 'postgresql://localhost/test' };
  assert.doesNotThrow(() => assertDevelopmentSeed(local));
  for (const extra of [{ NODE_ENV: 'production' }, { NODE_ENV: undefined }, { VERCEL: '1' }, { VERCEL_ENV: 'preview' }, { VERCEL_TARGET_ENV: 'production' }, { DATABASE_URL: 'postgresql://remote/test' }]) {
    assert.throws(() => assertDevelopmentSeed({ ...local, ...extra }));
  }
});
