import 'dotenv/config';
import postgres from 'postgres';
import { join } from 'node:path';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is required');
}

const sql = postgres(url, { max: 1 });
const file = join(process.cwd(), 'drizzle', 'migrations', '0000_init.sql');
await sql.file(file);
await sql.end();
console.log('Migrations applied.');
