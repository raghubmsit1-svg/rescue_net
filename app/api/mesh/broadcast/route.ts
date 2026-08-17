import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { meshPackets } from '../../../../drizzle/schema';
import { requireUser } from '../../../../lib/authz';
import { meshBroadcastSchema } from '../../../../lib/validators';
import { makeId } from '../../../../lib/ids';
import { publishEvent } from '../../../../lib/events';
import { formatRelativeShort } from '../../../../lib/format';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { error, session } = await requireUser(['hq']);
  if (error) return error;
  const parsed = meshBroadcastSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const id = makeId('PKT');
  const [row] = await db
    .insert(meshPackets)
    .values({
      id,
      sender: parsed.data.sender ?? session!.user.name ?? 'HQ Command Mesh Transmitter',
      payload: parsed.data.payload,
      hops: 1,
    })
    .returning();

  await db.execute(sql`
    UPDATE mesh_nodes
    SET packets_relayed = packets_relayed + 1
    WHERE status = 'Active'
  `);

  await publishEvent('mesh.packet', { id });
  return NextResponse.json({
    id: row.id,
    sender: row.sender,
    payload: row.payload,
    hops: row.hops,
    time: formatRelativeShort(row.createdAt),
  });
}
