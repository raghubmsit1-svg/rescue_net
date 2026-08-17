import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { agencies, dispatches, incidents } from '../../../../../drizzle/schema';
import { requireUser } from '../../../../../lib/authz';
import { assignAgencySchema } from '../../../../../lib/validators';
import { makeId } from '../../../../../lib/ids';
import { appendLog } from '../../../../../lib/ops';
import { publishEvent } from '../../../../../lib/events';
import { toIncident } from '../../../../../lib/mappers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireUser(['hq']);
  if (error) return error;
  const { id } = await ctx.params;
  const parsed = assignAgencySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [inc] = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  if (!inc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [agency] = await db.select().from(agencies).where(eq(agencies.id, parsed.data.agencyId)).limit(1);
  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });

  await db.insert(dispatches).values({
    id: makeId('DSP'),
    incidentId: id,
    agencyId: agency.id,
    assignedBy: session!.user.id,
  });

  const [updated] = await db
    .update(incidents)
    .set({
      assignedAgency: agency.name,
      status: inc.status === 'Pending' ? 'Dispatched' : inc.status,
      updatedAt: new Date(),
    })
    .where(eq(incidents.id, id))
    .returning();

  await db
    .update(agencies)
    .set({ statusText: 'AGENCY DISPATCHED' })
    .where(eq(agencies.id, agency.id));

  await appendLog({
    type: 'system',
    logText: `Dispatch order issued for ${agency.name} [${agency.id}].`,
    incidentId: id,
  });
  await publishEvent('agency.assigned', { incidentId: id, agencyId: agency.id });
  await publishEvent('incident.dispatched', { id });

  return NextResponse.json(toIncident(updated));
}
