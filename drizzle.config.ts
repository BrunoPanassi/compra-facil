import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl =
  process.env.DATABASE_DIRECT_URL ||
  process.env.DATABASE_URL ||
  'postgresql://compra_facil:compra_facil@localhost:5432/compra_facil';

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/database/schema/index.ts',
  out: './server/database/migrations',
  dbCredentials: {
    url: databaseUrl,
  },
});
