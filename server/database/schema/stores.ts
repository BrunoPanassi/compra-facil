import { index, integer, numeric, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { users } from './users';

export const stores = pgTable(
  'stores',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    street: text('street').notNull(),
    nr: integer('nr').notNull(),
    neighbr: text('neighbr').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zip: text('zip').notNull(),
    lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
    lon: numeric('lon', { precision: 10, scale: 7 }).notNull(),
    ownerId: integer('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    description: text('description'),
    cellphone: text('cellphone').notNull(),
    cellphoneSecond: text('cellphone_second'),
    email: text('email'),
    facebook: text('facebook'),
    instagram: text('instagram'),
    another: text('another'),
  },
  (table) => [index('stores_owner_id_idx').on(table.ownerId)],
);
