import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { incidents, telemetryLogs } from '../../../../drizzle/schema';
import { requireUser } from '../../../../lib/authz';
import { toIncident, toLog } from '../../../../lib/mappers';
import { patchIncidentSchema } from '../../../../lib/validators';
import { appendLog, rescoreIncident } from '../../../../lib/ops';
import { publishEvent } from '../../../../lib/events';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error } = await requireUser(['hq', 'responder']);
  if (error) return error;
  const { id } = await ctx.params;
  const [row] = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const logs = await db
    .select()
    .from(telemetryLogs)
    .where(eq(telemetryLogs.incidentId, id))
    .orderBy(desc(telemetryLogs.createdAt));
  return NextResponse.json({ incident: toIncident(row), logs: logs.map(toLog) });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error } = await requireUser(['hq']);
  if (error) return error;
  const { id } = await ctx.params;
  const parsed = patchIncidentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [existing] = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db
    .update(incidents)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(incidents.id, id));

  const updated = await rescoreIncident(id);
  await appendLog({
    type: 'system',
    logText: `Incident ${id} details updated.`,
    incidentId: id,
  });
  await publishEvent('incident.updated', { id });
  return NextResponse.json(toIncident(updated ?? existing));
}
