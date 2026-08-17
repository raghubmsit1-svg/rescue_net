import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { sosAlerts } from '../../../../drizzle/schema';
import { requireUser } from '../../../../lib/authz';
import { toSos } from '../../../../lib/mappers';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error } = await requireUser(['civilian', 'responder', 'hq']);
  if (error) return error;
  const { id } = await ctx.params;
  const [row] = await db.select().from(sosAlerts).where(eq(sosAlerts.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(toSos(row));
}
