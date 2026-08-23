import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const materialTypes = pgTable('material_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});
