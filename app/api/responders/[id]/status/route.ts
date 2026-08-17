import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { incidents, responders } from '../../../../../drizzle/schema';
import { requireUser } from '../../../../../lib/authz';
import { responderStatusSchema } from '../../../../../lib/validators';
import { toResponder } from '../../../../../lib/mappers';
import { publishEvent } from '../../../../../lib/events';
import { appendLog } from '../../../../../lib/ops';

export const dynamic = 'force-dynamic';

const STATUS_MAP: Record<string, string> = {
  'En Route': 'Safe / On Task',
  'On Scene': 'Safe / On Task',
  Cleared: 'Rest Period',
};

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireUser(['hq', 'responder']);
  if (error) return error;
  const { id } = await ctx.params;
  if (session!.user.role === 'responder' && session!.user.responderId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const parsed = responderStatusSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [existing] = await db.select().from(responders).where(eq(responders.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const mapped = STATUS_MAP[parsed.data.status] ?? parsed.data.status;
  const [updated] = await db
    .update(responders)
    .set({ status: mapped })
    .where(eq(responders.id, id))
    .returning();

  if (existing.assignedIncidentId && parsed.data.status === 'On Scene') {
    await db
      .update(incidents)
      .set({ status: 'On Scene', updatedAt: new Date() })
      .where(eq(incidents.id, existing.assignedIncidentId));
    await publishEvent('incident.updated', { id: existing.assignedIncidentId });
  }
  if (existing.assignedIncidentId && parsed.data.status === 'Cleared') {
    await db
      .update(incidents)
      .set({ status: 'Resolved', updatedAt: new Date() })
      .where(eq(incidents.id, existing.assignedIncidentId));
    await publishEvent('incident.updated', { id: existing.assignedIncidentId });
  }

  await appendLog({
    type: 'system',
    logText: `Responder ${existing.name} status updated to ${parsed.data.status}.`,
    incidentId: existing.assignedIncidentId,
  });
  await publishEvent('responder.heartbeat', { id, status: mapped });
  return NextResponse.json({ responder: toResponder(updated), missionStatus: parsed.data.status });
}
