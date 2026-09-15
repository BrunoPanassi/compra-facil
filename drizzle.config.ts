import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl =
  process.env.DATABASE_DIRECT_URL ||
  process.env.DATABASE_URL || '';

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/database/schema/index.ts',
  out: './server/database/migrations',
  dbCredentials: {
    url: databaseUrl,
  },
});
