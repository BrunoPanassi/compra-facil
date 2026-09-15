import type { PoolConfig } from 'pg';

function positiveInteger(value: string | undefined, fallback: number, max: number): number {
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0 || number > max) throw new Error('Invalid database pool configuration.');
  return number;
}

export function poolOptions(env: NodeJS.ProcessEnv): PoolConfig {
  const connectionString = env.DATABASE_URL || env.NUXT_DATABASE_URL;
  if (!connectionString) throw new Error('Database connection is not configured.');
  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Invalid database configuration.');
  if (env.VERCEL && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('A managed database is required on Vercel.');
  if (env.DATABASE_SSL && !['true', 'false'].includes(env.DATABASE_SSL)) throw new Error('Invalid database SSL configuration.');
  // pg connection-string SSL options must not override certificate verification.
  if (env.DATABASE_SSL === 'true') {
    for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(key);
  }
  return {
    connectionString: url.toString(),
    max: positiveInteger(env.DATABASE_POOL_MAX, 3, 20),
    connectionTimeoutMillis: positiveInteger(env.DATABASE_CONNECT_TIMEOUT_MS, 5000, 60000),
    idleTimeoutMillis: positiveInteger(env.DATABASE_IDLE_TIMEOUT_MS, 10000, 300000),
    statement_timeout: positiveInteger(env.DATABASE_STATEMENT_TIMEOUT_MS, 10000, 300000),
    allowExitOnIdle: true,
    ...(env.DATABASE_SSL === 'true' ? { ssl: { rejectUnauthorized: true, ...(env.DATABASE_SSL_CA ? { ca: env.DATABASE_SSL_CA.replace(/\\n/g, '\n') } : {}) } } : {}),
  };
}
