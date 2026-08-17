import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { meshNodes } from '../../../../drizzle/schema';
import { requireUser } from '../../../../lib/authz';
import { toMeshNode } from '../../../../lib/mappers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireUser(['hq', 'responder']);
  if (error) return error;
  const rows = await db.select().from(meshNodes);
  return NextResponse.json(rows.map(toMeshNode));
}
