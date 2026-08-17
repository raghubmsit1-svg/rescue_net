import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { meshPackets } from '../../../../drizzle/schema';
import { requireUser } from '../../../../lib/authz';
import { formatRelativeShort } from '../../../../lib/format';
import type { MeshPacket } from '../../../../types/rescue';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireUser(['hq', 'responder']);
  if (error) return error;
  const rows = await db.select().from(meshPackets).orderBy(desc(meshPackets.createdAt)).limit(50);
  const packets: MeshPacket[] = rows.map((r) => ({
    id: r.id,
    sender: r.sender,
    payload: r.payload,
    hops: r.hops,
    time: formatRelativeShort(r.createdAt),
  }));
  return NextResponse.json(packets);
}
