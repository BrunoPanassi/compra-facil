import { check, index, integer, numeric, pgTable, serial, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { products } from './products';
import { stores } from './stores';

export const productStores = pgTable(
  'product_stores',
  {
    id: serial('id').primaryKey(),
    idStore: integer('id_store')
      .notNull()
      .references(() => stores.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    idProduct: integer('id_product')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    price: numeric('price', { precision: 12, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
  },
  (table) => [
    index('product_stores_id_store_idx').on(table.idStore),
    index('product_stores_id_product_idx').on(table.idProduct),
    uniqueIndex('product_stores_store_product_uidx').on(table.idStore, table.idProduct),
    check('product_stores_price_non_negative', sql`${table.price} >= 0`),
    check('product_stores_quantity_non_negative', sql`${table.quantity} >= 0`),
  ],
);
