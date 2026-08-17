import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { responders, sosAlerts } from '../../../../../drizzle/schema';
import { requireUser } from '../../../../../lib/authz';
import { createSosSchema } from '../../../../../lib/validators';
import { toResponder } from '../../../../../lib/mappers';
import { publishEvent } from '../../../../../lib/events';
import { appendLog } from '../../../../../lib/ops';
import { makeId } from '../../../../../lib/ids';
import { ALAPPUZHA } from '../../../../../lib/geo';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireUser(['hq', 'responder']);
  if (error) return error;
  const { id } = await ctx.params;
  if (session!.user.role === 'responder' && session!.user.responderId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const [existing] = await db.select().from(responders).where(eq(responders.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let sosType: string = 'General SOS';
  try {
    const parsed = createSosSchema.partial().safeParse(await req.json());
    if (parsed.success && parsed.data.type) sosType = parsed.data.type;
  } catch {
    /* empty body ok */
  }

  const [updated] = await db
    .update(responders)
    .set({ status: 'SOS Alert', hazardRisk: 'Severe Risk' })
    .where(eq(responders.id, id))
    .returning();

  const sosId = makeId('SOS');
  await db.insert(sosAlerts).values({
    id: sosId,
    type: sosType,
    lat: existing.lat || ALAPPUZHA.lat,
    lng: existing.lng || ALAPPUZHA.lng,
    address: `${existing.unit} mayday`,
    accuracyMeters: 8,
    status: 'Received',
    incidentId: existing.assignedIncidentId,
    createdBy: session!.user.id,
  });

  await appendLog({
    type: 'call',
    logText: `RESPONDER MAYDAY: ${existing.name} (${existing.unit}) — ${sosType}`,
    incidentId: existing.assignedIncidentId,
  });
  await publishEvent('responder.mayday', { id, sosId });
  await publishEvent('sos.received', { id: sosId, incidentId: existing.assignedIncidentId });
  return NextResponse.json(toResponder(updated));
}
