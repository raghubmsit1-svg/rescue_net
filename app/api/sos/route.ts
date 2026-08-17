import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { incidents, sosAlerts } from '../../../drizzle/schema';
import { auth } from '@/auth';
import { createSosSchema } from '../../../lib/validators';
import { clientIp, rateLimit } from '../../../lib/rate-limit';
import { makeId } from '../../../lib/ids';
import { appendLog, findNearbyOpenIncident, scoreIncidentRow } from '../../../lib/ops';
import { publishEvent } from '../../../lib/events';
import { toSos } from '../../../lib/mappers';
import { coordsForSector } from '../../../lib/geo';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = clientIp(req);
  const allowed = await rateLimit(`ratelimit:sos:${ip}`, 10, 60);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many SOS requests' }, { status: 429 });
  }

  const parsed = createSosSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const session = await auth();
  const body = parsed.data;
  let incidentId = await findNearbyOpenIncident(body.location.lat, body.location.lng);

  if (!incidentId) {
    incidentId = makeId('INC');
    const coords = body.location.lat
      ? { lat: body.location.lat, lng: body.location.lng }
      : coordsForSector('', body.location.address);
    const scored = await scoreIncidentRow({
      id: incidentId,
      casualtiesEst: body.type === 'Medical Help' || body.type === 'Rescue Needed' ? 1 : 0,
      waterLevelRising: body.type === 'Rescue Needed',
      structuralRisk: body.type === 'Hazard' ? 'High' : 'Medium',
      createdAt: new Date(),
      lat: coords.lat,
      lng: coords.lng,
    });
    await db.insert(incidents).values({
      id: incidentId,
      title: `${body.type} reported`,
      location: body.location.address || 'Unknown coordinates',
      sector: 'Unassigned',
      priority: scored.priority,
      urgencyLabel: scored.urgencyLabel,
      description: `Civilian SOS (${body.type}) received via Victim SOS Portal.`,
      status: 'Pending',
      casualtiesEst: body.type === 'Medical Help' || body.type === 'Rescue Needed' ? 1 : 0,
      waterLevelRising: body.type === 'Rescue Needed',
      structuralRisk: body.type === 'Hazard' ? 'High' : 'Medium',
      lat: coords.lat,
      lng: coords.lng,
      priorityScore: scored.priorityScore,
    });
    await publishEvent('incident.created', { id: incidentId });
  }

  const id = makeId('SOS');
  const [row] = await db
    .insert(sosAlerts)
    .values({
      id,
      type: body.type,
      lat: body.location.lat,
      lng: body.location.lng,
      address: body.location.address,
      accuracyMeters: body.accuracyMeters,
      status: 'Received',
      incidentId,
      createdBy: session?.user?.id ?? null,
    })
    .returning();

  await appendLog({
    type: 'call',
    logText: `Distress ping received (${body.type}) from (${body.location.lat}, ${body.location.lng}).`,
    incidentId,
  });
  await publishEvent('sos.received', { id, incidentId });

  return NextResponse.json(toSos(row), { status: 201 });
}
