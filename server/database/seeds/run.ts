import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { assertDevelopmentSeed } from './guard';
import { poolOptions } from '../pool-options';

async function main() {
  assertDevelopmentSeed(process.env);
  const source = await readFile(new URL('./development-demo.sql', import.meta.url), 'utf8');
  const pool = new Pool(poolOptions(process.env));
  try {
    const client = await pool.connect();
    try {
      await client.query("SET compra_facil.seed_environment = 'development'");
      await client.query(source);
      console.info('Development seed completed.');
    } finally { client.release(); }
  } finally { await pool.end(); }
}
main().catch(() => {
  console.error('Seed refused or failed. Check the local environment and seed prerequisites.');
  process.exitCode = 1;
});
