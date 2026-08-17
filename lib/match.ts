import { eq, ne, sql } from 'drizzle-orm';
import { db } from './db';
import { agencies, dispatches, incidents } from '../drizzle/schema';
import { computeMatchScore } from './scoring';
import { toAgencyMatch } from './mappers';
import type { AgencyMatch } from '../types/rescue';

export async function matchAgencies(incidentId: string, radiusKm = 25): Promise<AgencyMatch[] | null> {
  const [inc] = await db.select().from(incidents).where(eq(incidents.id, incidentId)).limit(1);
  if (!inc) return null;

  const rows = await db.execute<{
    id: string;
    name: string;
    equipment: string[];
    certifications: string[];
    aerial_support: number;
    status_text: string;
    lat: number;
    lng: number;
    distance_km: string | number;
  }>(sql`
    SELECT
      a.id,
      a.name,
      a.equipment,
      a.certifications,
      a.aerial_support,
      a.status_text,
      a.lat,
      a.lng,
      ST_Distance(
        ST_SetSRID(ST_MakePoint(a.lng, a.lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${inc.lng}, ${inc.lat}), 4326)::geography
      ) / 1000.0 AS distance_km
    FROM agencies a
    WHERE ST_DWithin(
      ST_SetSRID(ST_MakePoint(a.lng, a.lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(${inc.lng}, ${inc.lat}), 4326)::geography,
      ${radiusKm * 1000}
    )
  `);

  const allDispatches = await db.select().from(dispatches);
  const open = await db.select({ id: incidents.id }).from(incidents).where(ne(incidents.status, 'Resolved'));
  const openIds = new Set(open.map((i) => i.id));

  const matches = [...rows].map((r) => {
    const assignedLoad = allDispatches.filter((d) => d.agencyId === r.id && openIds.has(d.incidentId)).length;
    const assigned = allDispatches.some((d) => d.agencyId === r.id && d.incidentId === incidentId);
    const distanceKm = Number(r.distance_km);
    const equipment = r.equipment ?? [];
    const certifications = r.certifications ?? [];
    const matchScore = computeMatchScore({
      distanceKm,
      equipment,
      certifications,
      aerialSupport: Number(r.aerial_support),
      assignedLoad,
      waterLevelRising: inc.waterLevelRising,
    });
    return toAgencyMatch({
      id: r.id,
      name: r.name,
      equipment,
      certifications,
      aerialSupport: Number(r.aerial_support),
      statusText: r.status_text,
      lat: r.lat,
      lng: r.lng,
      createdAt: new Date(),
      distanceKm,
      assigned,
      assignedLoad,
      matchScore,
    });
  });

  matches.sort((a, b) => b.matchScore - a.matchScore);
  return matches;
}
