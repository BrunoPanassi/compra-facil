import { pgEnum, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', [
  'CLIENT',
  'ADMIN',
  'SERVICE_PROVIDER',
  'STORE_OWNER',
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  telefone: text('telefone').notNull().unique(),
  senha: text('senha').notNull(),
  role: userRole('role').notNull(),
});
