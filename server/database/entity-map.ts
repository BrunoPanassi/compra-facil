import {
  materialTypes,
  materials,
  products,
  productStores,
  stores,
  users,
} from './schema';
import type { AnyPgColumn, AnyPgTable } from 'drizzle-orm/pg-core';

export const entityNames = [
  'users',
  'stores',
  'materials',
  'products',
  'material-types',
  'product-store',
] as const;

export type EntityName = (typeof entityNames)[number];

type DatabaseRecord = Record<string, unknown>;

interface EntityMapping {
  table: AnyPgTable & { id: AnyPgColumn };
  toDatabase: (record: DatabaseRecord) => DatabaseRecord;
  fromDatabase: (record: DatabaseRecord) => DatabaseRecord;
}

function removeUndefined(record: DatabaseRecord): DatabaseRecord {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  );
}

function asText(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return value;
  return String(value);
}

function asNumber(value: unknown): number | null | undefined {
  if (value === null || value === undefined) return value;
  return Number(value);
}

const identity = (record: DatabaseRecord) => removeUndefined({ ...record });

const entityMap: Record<EntityName, EntityMapping> = {
  users: {
    table: users,
    toDatabase: ({ nome, telefone, senha, role }) =>
      removeUndefined({ nome, telefone: asText(telefone), senha, role }),
    fromDatabase: identity,
  },
  stores: {
    table: stores,
    toDatabase: (record) => removeUndefined({
      name: record.name,
      street: record.street,
      nr: record.nr,
      neighbr: record.neighbr,
      city: record.city,
      state: record.state,
      zip: asText(record.zip),
      lat: asText(record.lat),
      lon: asText(record.lon),
      ownerId: record.owner_id,
      description: record.description,
      cellphone: asText(record.cellphone),
      cellphoneSecond: asText(record.cellphone_second),
      email: record.email,
      facebook: record.facebook,
      instagram: record.instagram,
      another: record.another,
    }),
    fromDatabase: (record) => removeUndefined({
      id: record.id,
      name: record.name,
      street: record.street,
      nr: record.nr,
      neighbr: record.neighbr,
      city: record.city,
      state: record.state,
      zip: record.zip,
      lat: asNumber(record.lat),
      lon: asNumber(record.lon),
      owner_id: record.ownerId,
      description: record.description,
      cellphone: record.cellphone,
      cellphone_second: record.cellphoneSecond,
      email: record.email,
      facebook: record.facebook,
      instagram: record.instagram,
      another: record.another,
    }),
  },
  materials: {
    table: materials,
    toDatabase: (record) => removeUndefined({
      name: record.name,
      weight: record.weight,
      typeId: record.type_id,
    }),
    fromDatabase: (record) => removeUndefined({
      id: record.id,
      name: record.name,
      weight: asNumber(record.weight),
      type_id: record.typeId,
    }),
  },
  products: {
    table: products,
    toDatabase: (record) => removeUndefined({
      name: record.name,
      brand: record.brand,
      desc: record.desc,
      materialId: record.material_id,
      images: record.images,
    }),
    fromDatabase: (record) => removeUndefined({
      id: record.id,
      name: record.name,
      brand: record.brand,
      desc: record.desc,
      material_id: record.materialId,
      images: record.images,
    }),
  },
  'material-types': {
    table: materialTypes,
    toDatabase: ({ name }) => removeUndefined({ name }),
    fromDatabase: identity,
  },
  'product-store': {
    table: productStores,
    toDatabase: (record) => removeUndefined({
      idStore: record.id_store,
      idProduct: record.id_product,
      price: asText(record.price),
      quantity: record.quantity,
    }),
    fromDatabase: (record) => removeUndefined({
      id: record.id,
      id_store: record.idStore,
      id_product: record.idProduct,
      price: record.price,
      quantity: record.quantity,
    }),
  },
};

export function getEntityMapping(entityName: string): EntityMapping {
  if (!entityNames.includes(entityName as EntityName)) {
    throw new Error(`Unknown persistence entity: "${entityName}".`);
  }

  return entityMap[entityName as EntityName];
}
