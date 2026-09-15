import { createError } from 'h3';

export function invalidInput(): never {
  throw createError({ statusCode: 400, message: 'Dados inválidos.' });
}
export function validId(value: unknown): number {
  if (typeof value !== 'number' && typeof value !== 'string') return invalidInput();
  if (typeof value === 'string' && !/^\d+$/.test(value)) return invalidInput();
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) return invalidInput();
  return id;
}
export function queryIds(value: unknown): number[] {
  if (value === undefined) return [];
  const values = Array.isArray(value) ? value : [value];
  if (values.length > 100) return invalidInput();
  return values.map(validId);
}
const fields: Record<string, string[]> = {
  product: ['name', 'brand', 'desc', 'material_id', 'images'],
  'product-store': ['id_store', 'id_product', 'price', 'quantity'],
  material: ['name', 'weight', 'type_id'],
  'material-type': ['name'],
  store: ['name', 'street', 'nr', 'neighbr', 'city', 'state', 'zip', 'lat', 'lon', 'owner_id', 'description', 'cellphone', 'cellphone_second', 'email', 'facebook', 'instagram', 'another'],
  register: ['nome', 'telefone', 'senha', 'role'],
  login: ['telefone', 'senha'],
};
const required: Record<string, string[]> = {
  product: ['name', 'brand', 'material_id', 'images'],
  'product-store': fields['product-store'], material: ['name', 'type_id'], 'material-type': ['name'],
  store: ['name', 'street', 'nr', 'neighbr', 'city', 'state', 'zip', 'lat', 'lon', 'owner_id', 'cellphone'],
  register: fields.register, login: fields.login,
};
export function validatePayload(entity: string, body: unknown, partial = false): void {
  const allowed = fields[entity];
  if (!allowed) return;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return invalidInput();
  const values = Object.fromEntries(Object.entries(body));
  // UI sends id on existing forms; it is checked but never used in SET/INSERT.
  for (const [key, value] of Object.entries(values)) {
    if (key === 'id') { if (value !== 0) validId(value); continue; }
    if (!allowed.includes(key)) return invalidInput();
    if (['material_id', 'type_id', 'id_store', 'id_product', 'owner_id'].includes(key)) { validId(value); if (typeof value !== 'number') invalidInput(); }
    else if (key === 'quantity' || key === 'nr') {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 2147483647) invalidInput();
    } else if (key === 'price') {
      if (typeof value !== 'string' || !/^\d{1,10}(\.\d{1,2})?$/.test(value)) invalidInput();
    } else if (key === 'images') {
      if (!Array.isArray(value) || value.length > 20 || value.some(image => typeof image !== 'string' || image.length > 2_000_000)) invalidInput();
    } else if (['telefone', 'cellphone', 'cellphone_second'].includes(key)) {
      if (key === 'cellphone_second' && (value === null || value === '')) continue;
      if (typeof value !== 'string' || !/^\+?[\d ()-]{8,20}$/.test(value)) invalidInput();
    } else if (key === 'zip') {
      if (typeof value !== 'string' || !/^\d{8}$/.test(value)) invalidInput();
    } else if (key === 'role') {
      if (!['CLIENT', 'STORE_OWNER', 'SERVICE_PROVIDER'].includes(String(value))) invalidInput();
    } else if (key === 'senha') {
      if (typeof value !== 'string' || value.length < (entity === 'register' ? 8 : 1) || Buffer.byteLength(value) > 72) invalidInput();
    } else if (key === 'lat' || key === 'lon') {
      if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > (key === 'lat' ? 90 : 180)) invalidInput();
    } else if (key === 'weight') {
      if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) invalidInput();
    } else if (value !== null && (typeof value !== 'string' || value.length > 10000)) invalidInput();
  }
  if (!partial && required[entity].some(key => values[key] === undefined || values[key] === null || values[key] === '')) invalidInput();
}
