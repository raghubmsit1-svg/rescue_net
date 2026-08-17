import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { incidents } from '../../../../../drizzle/schema';
import { requireUser } from '../../../../../lib/authz';
import { toIncident } from '../../../../../lib/mappers';
import { appendLog } from '../../../../../lib/ops';
import { publishEvent } from '../../../../../lib/events';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireUser(['hq']);
  if (error) return error;
  const { id } = await ctx.params;
  const [row] = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (row.status === 'Resolved') {
    return NextResponse.json({ error: 'Incident already resolved' }, { status: 409 });
  }

  const [updated] = await db
    .update(incidents)
    .set({ status: 'Dispatched', updatedAt: new Date() })
    .where(eq(incidents.id, id))
    .returning();

  await appendLog({
    type: 'system',
    logText: `Unit dispatched for ${id} (${row.title}) by ${session!.user.name ?? 'HQ'}.`,
    incidentId: id,
  });
  await publishEvent('incident.dispatched', { id });
  return NextResponse.json(toIncident(updated));
}
