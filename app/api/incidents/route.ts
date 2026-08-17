import { NextResponse } from 'next/server';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { incidents } from '../../../drizzle/schema';
import { requireUser } from '../../../lib/authz';
import { toIncident } from '../../../lib/mappers';
import { createIncidentSchema } from '../../../lib/validators';
import { coordsForSector } from '../../../lib/geo';
import { makeId } from '../../../lib/ids';
import { appendLog, scoreIncidentRow } from '../../../lib/ops';
import { publishEvent } from '../../../lib/events';
import { computePriorityScore } from '../../../lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { error } = await requireUser(['hq', 'responder']);
  if (error) return error;

  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const status = url.searchParams.get('status');
  const priority = url.searchParams.get('priority');

  const filters = [];
  if (status) filters.push(eq(incidents.status, status));
  if (priority) filters.push(eq(incidents.priority, priority));
  if (q) {
    const like = `%${q}%`;
    filters.push(
      or(ilike(incidents.title, like), ilike(incidents.sector, like), ilike(incidents.id, like), ilike(incidents.location, like))
    );
  }

  const rows = await db
    .select()
    .from(incidents)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(incidents.createdAt));

  return NextResponse.json(rows.map(toIncident));
}

export async function POST(req: Request) {
  const { error, session } = await requireUser(['hq']);
  if (error) return error;

  const parsed = createIncidentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  const coords = body.coordinates ?? coordsForSector(body.sector, body.location);
  const id = makeId('INC');
  const scored = body.priority
    ? {
        priority: body.priority,
        urgencyLabel: computePriorityScore({
          casualtiesEst: body.casualtiesEst,
          waterLevelRising: body.waterLevelRising,
          structuralRisk: body.structuralRisk,
          nearbySosCount: 0,
          elapsedHours: 0,
        }).urgencyLabel,
        priorityScore: computePriorityScore({
          casualtiesEst: body.casualtiesEst,
          waterLevelRising: body.waterLevelRising,
          structuralRisk: body.structuralRisk,
          nearbySosCount: 0,
          elapsedHours: 0,
        }).priorityScore,
      }
    : await scoreIncidentRow({
        id,
        casualtiesEst: body.casualtiesEst,
        waterLevelRising: body.waterLevelRising,
        structuralRisk: body.structuralRisk,
        createdAt: new Date(),
        lat: coords.lat,
        lng: coords.lng,
      });

  const [row] = await db
    .insert(incidents)
    .values({
      id,
      title: body.title,
      location: body.location,
      sector: body.sector,
      priority: scored.priority,
      urgencyLabel: scored.urgencyLabel,
      description: body.description,
      status: 'Pending',
      casualtiesEst: body.casualtiesEst,
      waterLevelRising: body.waterLevelRising,
      structuralRisk: body.structuralRisk,
      lat: coords.lat,
      lng: coords.lng,
      priorityScore: scored.priorityScore,
    })
    .returning();

  await appendLog({
    type: 'system',
    logText: `Incident ${id} registered by ${session!.user.name ?? 'HQ'}: ${body.title}`,
    incidentId: id,
  });
  await publishEvent('incident.created', { id });

  return NextResponse.json(toIncident(row), { status: 201 });
}
