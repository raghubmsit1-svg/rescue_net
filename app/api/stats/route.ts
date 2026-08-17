import { NextResponse } from 'next/server';
import { count, eq, ne, sql } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { incidents, meshNodes, meshPackets, responders } from '../../../drizzle/schema';
import { requireUser } from '../../../lib/authz';
import type { OpsStats } from '../../../types/rescue';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const [resolved] = await db
    .select({ n: sql<number>`coalesce(sum(${incidents.casualtiesEst}), 0)` })
    .from(incidents)
    .where(eq(incidents.status, 'Resolved'));

  const [deployed] = await db.select({ n: count() }).from(responders).where(ne(responders.status, 'Rest Period'));
  const [critical] = await db
    .select({ n: count() })
    .from(incidents)
    .where(sql`${incidents.priority} = 'Crit-01' AND ${incidents.status} <> 'Resolved'`);
  const [open] = await db.select({ n: count() }).from(incidents).where(ne(incidents.status, 'Resolved'));
  const [meshActive] = await db.select({ n: count() }).from(meshNodes).where(eq(meshNodes.status, 'Active'));
  const [meshTotal] = await db.select({ n: count() }).from(meshNodes);
  const [pkts] = await db.select({ n: sql<number>`coalesce(sum(${meshNodes.packetsRelayed}), 0)` }).from(meshNodes);
  const [rssi] = await db
    .select({ n: sql<number>`coalesce(avg(${meshNodes.rssi}), 0)` })
    .from(meshNodes)
    .where(eq(meshNodes.status, 'Active'));
  const [pktRows] = await db.select({ n: count() }).from(meshPackets);

  const stats: OpsStats = {
    totalRescues: Number(resolved?.n ?? 0),
    deployedUnits: Number(deployed?.n ?? 0),
    criticalCount: Number(critical?.n ?? 0),
    openIncidents: Number(open?.n ?? 0),
    activeMeshNodes: Number(meshActive?.n ?? 0),
    meshNodeCount: Number(meshTotal?.n ?? 0),
    packetsRelayed: Number(pkts?.n ?? 0) + Number(pktRows?.n ?? 0),
    avgRssi: Math.round(Number(rssi?.n ?? 0)),
  };

  return NextResponse.json(stats);
}
