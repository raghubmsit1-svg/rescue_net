import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../../lib/db';
import { meshNodes } from '../../../../../../drizzle/schema';
import { requireUser } from '../../../../../../lib/authz';
import { toMeshNode } from '../../../../../../lib/mappers';
import { publishEvent } from '../../../../../../lib/events';
import { appendLog } from '../../../../../../lib/ops';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { error } = await requireUser(['hq']);
  if (error) return error;
  const { id } = await ctx.params;
  const [existing] = await db.select().from(meshNodes).where(eq(meshNodes.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [updated] = await db
    .update(meshNodes)
    .set({ lastPingAt: new Date(), status: existing.batteryLevel === 0 ? 'Offline' : 'Active' })
    .where(eq(meshNodes.id, id))
    .returning();

  await appendLog({
    type: 'system',
    logText: `Ping sent to mesh node ${existing.name} [${id}]. RSSI ${existing.rssi} dBm.`,
  });
  await publishEvent('mesh.heartbeat', { id });
  return NextResponse.json(toMeshNode(updated));
}
