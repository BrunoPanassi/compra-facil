import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { poolOptions } from './pool-options';
import * as schema from './schema';

type Database = NodePgDatabase<typeof schema>;
const globalDatabase = globalThis as typeof globalThis & {
  compraFacilPool?: Pool;
  compraFacilDatabase?: Database;
};

export function getDatabase(): Database {
  if (globalDatabase.compraFacilDatabase) return globalDatabase.compraFacilDatabase;
  const pool = globalDatabase.compraFacilPool ?? new Pool(poolOptions(process.env));
  if (!globalDatabase.compraFacilPool) {
    // Do not log driver errors: they can contain connection details or SQL.
    pool.on('error', () => { console.error('An idle database connection failed.'); });
    if (process.env.VERCEL === '1') attachDatabasePool(pool);
    globalDatabase.compraFacilPool = pool;
  }
  globalDatabase.compraFacilDatabase = drizzle(pool, { schema });
  return globalDatabase.compraFacilDatabase;
}
