import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { useRuntimeConfig } from '#imports';
import * as schema from './schema';

type Database = NodePgDatabase<typeof schema>;

const globalDatabase = globalThis as typeof globalThis & {
  compraFacilPool?: Pool;
  compraFacilDatabase?: Database;
};

export function getDatabase(): Database {
  if (globalDatabase.compraFacilDatabase) {
    return globalDatabase.compraFacilDatabase;
  }

  const config = useRuntimeConfig();
  const databaseUrl = config.databaseUrl as string | undefined;

  if (!databaseUrl?.trim()) {
    throw new Error(
      'PostgreSQL connection was requested, but NUXT_DATABASE_URL or DATABASE_URL is not configured.',
    );
  }

  const pool = globalDatabase.compraFacilPool ?? new Pool({ connectionString: databaseUrl });
  const database = drizzle(pool, { schema });

  globalDatabase.compraFacilPool = pool;
  globalDatabase.compraFacilDatabase = database;

  return database;
}
