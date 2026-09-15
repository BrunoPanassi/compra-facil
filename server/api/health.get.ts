import { sql } from 'drizzle-orm';
import { setResponseStatus } from 'h3';
import { useRuntimeConfig } from '#imports';
import { getDatabase } from '../database/client';
import { isSqlEnabled } from '../utils/adapter';

export default defineEventHandler(async event => {
  const adapter = isSqlEnabled(useRuntimeConfig().useSql) ? 'sql' : 'jsonbin';
  if (adapter === 'jsonbin') return { application: 'available', adapter, database: 'not-applicable' };
  try {
    await getDatabase().execute(sql`select 1`);
    return { application: 'available', adapter, database: 'available' };
  } catch {
    setResponseStatus(event, 503);
    return { application: 'available', adapter, database: 'unavailable' };
  }
});
