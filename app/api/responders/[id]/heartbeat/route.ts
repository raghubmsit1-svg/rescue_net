import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { responders } from '../../../../../drizzle/schema';
import { requireUser } from '../../../../../lib/authz';
import { heartbeatSchema } from '../../../../../lib/validators';
import { toResponder } from '../../../../../lib/mappers';
import { publishEvent } from '../../../../../lib/events';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireUser(['hq', 'responder']);
  if (error) return error;
  const { id } = await ctx.params;
  if (session!.user.role === 'responder' && session!.user.responderId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const parsed = heartbeatSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const [existing] = await db.select().from(responders).where(eq(responders.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [updated] = await db
    .update(responders)
    .set({
      lat: parsed.data.lat ?? existing.lat,
      lng: parsed.data.lng ?? existing.lng,
      battery: parsed.data.battery ?? existing.battery,
      heartRateBpm: parsed.data.heartRateBpm ?? existing.heartRateBpm,
      hazardRisk: parsed.data.hazardRisk ?? existing.hazardRisk,
    })
    .where(eq(responders.id, id))
    .returning();

  await publishEvent('responder.heartbeat', { id });
  return NextResponse.json(toResponder(updated));
}
