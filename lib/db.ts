import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../drizzle/schema';

const globalForDb = globalThis as unknown as {
  sql?: postgres.Sql;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  if (!globalForDb.sql) {
    globalForDb.sql = postgres(url, { max: 10 });
  }
  return globalForDb.sql;
}

export const db = globalForDb.db ?? drizzle(getClient(), { schema });
if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

export async function closeDb() {
  if (globalForDb.sql) {
    await globalForDb.sql.end();
    globalForDb.sql = undefined;
    globalForDb.db = undefined;
  }
}
