import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { responders } from '../../../drizzle/schema';
import { requireUser } from '../../../lib/authz';
import { toResponder } from '../../../lib/mappers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireUser(['hq', 'responder']);
  if (error) return error;
  const rows = await db.select().from(responders);
  return NextResponse.json(rows.map(toResponder));
}
