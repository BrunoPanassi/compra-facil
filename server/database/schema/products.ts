import { index, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { materials } from './materials';

export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    brand: text('brand').notNull(),
    desc: text('desc'),
    materialId: integer('material_id')
      .notNull()
      .references(() => materials.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    images: text('images').array().notNull(),
  },
  (table) => [index('products_material_id_idx').on(table.materialId)],
);
