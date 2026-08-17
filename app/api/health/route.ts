import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { pingRedis } from '../../../lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  let database = false;
  try {
    await db.execute(sql`SELECT 1`);
    database = true;
  } catch {
    database = false;
  }
  const redis = await pingRedis();
  const ok = database && redis;
  return NextResponse.json(
    { ok, database, redis },
    { status: ok ? 200 : 503 }
  );
}
