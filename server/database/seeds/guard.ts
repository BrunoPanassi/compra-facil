export function assertDevelopmentSeed(env: NodeJS.ProcessEnv): void {
  if (env.NODE_ENV !== 'development' || env.VERCEL || ['preview', 'production'].includes(env.VERCEL_ENV || '') || ['preview', 'production'].includes(env.VERCEL_TARGET_ENV || '')) {
    throw new Error('Seed refused: only explicit local NODE_ENV=development is allowed.');
  }
  const url = new URL(env.DATABASE_URL || '');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('Seed refused: a local database is required.');
  }
}
