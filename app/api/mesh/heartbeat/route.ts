import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { meshNodes } from '../../../../drizzle/schema';
import { auth } from '@/auth';
import { ingestAuthorized } from '../../../../lib/authz';
import { meshHeartbeatSchema } from '../../../../lib/validators';
import { toMeshNode } from '../../../../lib/mappers';
import { publishEvent } from '../../../../lib/events';
import { ALAPPUZHA } from '../../../../lib/geo';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user && !ingestAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session?.user && session.user.role !== 'hq' && session.user.role !== 'responder' && !ingestAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = meshHeartbeatSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  const [existing] = await db.select().from(meshNodes).where(eq(meshNodes.id, body.id)).limit(1);
  const lat = body.coordinates?.lat ?? existing?.lat ?? ALAPPUZHA.lat;
  const lng = body.coordinates?.lng ?? existing?.lng ?? ALAPPUZHA.lng;

  const values = {
    id: body.id,
    name: body.name ?? existing?.name ?? body.id,
    type: body.type ?? existing?.type ?? 'LORA Relay',
    status: 'Active' as const,
    batteryLevel: body.batteryLevel ?? existing?.batteryLevel ?? 100,
    rssi: body.rssi ?? existing?.rssi ?? -70,
    connectedPeers: body.connectedPeers ?? existing?.connectedPeers ?? 0,
    packetsRelayed: body.packetsRelayed ?? existing?.packetsRelayed ?? 0,
    lastPingAt: new Date(),
    lat,
    lng,
  };

  const [row] = existing
    ? await db.update(meshNodes).set(values).where(eq(meshNodes.id, body.id)).returning()
    : await db.insert(meshNodes).values(values).returning();

  await publishEvent('mesh.heartbeat', { id: row.id });
  return NextResponse.json(toMeshNode(row));
}
