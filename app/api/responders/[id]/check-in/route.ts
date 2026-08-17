import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { responders } from '../../../../../drizzle/schema';
import { requireUser } from '../../../../../lib/authz';
import { toResponder } from '../../../../../lib/mappers';
import { publishEvent } from '../../../../../lib/events';
import { appendLog } from '../../../../../lib/ops';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireUser(['hq', 'responder']);
  if (error) return error;
  const { id } = await ctx.params;
  if (session!.user.role === 'responder' && session!.user.responderId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const [existing] = await db.select().from(responders).where(eq(responders.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [updated] = await db
    .update(responders)
    .set({
      lastCheckInAt: new Date(),
      status: existing.status === 'SOS Alert' ? 'SOS Alert' : 'Safe / On Task',
    })
    .where(eq(responders.id, id))
    .returning();

  await appendLog({
    type: 'system',
    logText: `Responder safety check-in verified for ${existing.name}. Dead-man timer reset.`,
    incidentId: existing.assignedIncidentId,
  });
  await publishEvent('responder.checkin', { id });
  return NextResponse.json(toResponder(updated));
}
