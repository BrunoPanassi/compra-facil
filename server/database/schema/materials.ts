import { index, integer, numeric, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { materialTypes } from './material-types';

export const materials = pgTable(
  'materials',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    brand: text('brand'),
    weight: numeric('weight', { precision: 12, scale: 3 }),
    typeId: integer('type_id')
      .notNull()
      .references(() => materialTypes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  },
  (table) => [index('materials_type_id_idx').on(table.typeId)],
);
