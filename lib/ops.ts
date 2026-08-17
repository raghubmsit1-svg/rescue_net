import { eq, sql } from 'drizzle-orm';
import { db } from './db';
import { incidents, telemetryLogs } from '../drizzle/schema';
import { publishEvent } from './events';
import { formatIstClock } from './format';
import { makeId } from './ids';
import { computePriorityScore, type StructuralRisk } from './scoring';

export async function appendLog(opts: {
  type: 'drone' | 'sensor' | 'call' | 'system';
  logText: string;
  incidentId?: string | null;
}) {
  const id = makeId('LOG');
  const timestampLabel = formatIstClock();
  await db.insert(telemetryLogs).values({
    id,
    timestampLabel,
    logText: opts.logText,
    type: opts.type,
    incidentId: opts.incidentId ?? null,
  });
  await publishEvent('log.appended', { id, incidentId: opts.incidentId ?? null });
  return { id, timestamp: timestampLabel, logText: opts.logText, type: opts.type };
}

export async function nearbySosCount(lat: number, lng: number) {
  const rows = await db.execute<{ count: string }>(sql`
    SELECT COUNT(*)::text AS count
    FROM sos_alerts
    WHERE ST_DWithin(
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      2000
    )
  `);
  return Number(rows[0]?.count ?? 0);
}

export async function scoreIncidentRow(row: {
  id: string;
  casualtiesEst: number;
  waterLevelRising: boolean;
  structuralRisk: string;
  createdAt: Date;
  lat: number;
  lng: number;
}) {
  const sosCount = await nearbySosCount(row.lat, row.lng);
  return computePriorityScore({
    casualtiesEst: row.casualtiesEst,
    waterLevelRising: row.waterLevelRising,
    structuralRisk: row.structuralRisk as StructuralRisk,
    nearbySosCount: sosCount,
    elapsedHours: (Date.now() - row.createdAt.getTime()) / 3_600_000,
  });
}

export async function rescoreIncident(id: string) {
  const [inc] = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  if (!inc || inc.status === 'Resolved') return inc ?? null;
  const scored = await scoreIncidentRow(inc);
  if (
    scored.priorityScore === inc.priorityScore &&
    scored.priority === inc.priority &&
    scored.urgencyLabel === inc.urgencyLabel
  ) {
    return inc;
  }
  const [updated] = await db
    .update(incidents)
    .set({
      priorityScore: scored.priorityScore,
      priority: scored.priority,
      urgencyLabel: scored.urgencyLabel,
      updatedAt: new Date(),
    })
    .where(eq(incidents.id, id))
    .returning();
  await publishEvent('incident.updated', { id });
  return updated;
}

export async function findNearbyOpenIncident(lat: number, lng: number) {
  const rows = await db.execute<{ id: string }>(sql`
    SELECT id
    FROM incidents
    WHERE status <> 'Resolved'
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        2000
      )
    ORDER BY ST_Distance(
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
    )
    LIMIT 1
  `);
  return rows[0]?.id ?? null;
}
