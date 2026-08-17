import type { AgencyMatch, DataFeedLog, EmergencySOSPayload, Incident, MeshNode, ResponderSafety } from '../types/rescue';
import { formatElapsed, formatRelativeShort, formatTimeAgo, remainingDeadmanSec } from './format';
import type { agencies, incidents, meshNodes, responders, sosAlerts, telemetryLogs } from '../drizzle/schema';

type IncidentRow = typeof incidents.$inferSelect;
type AgencyRow = typeof agencies.$inferSelect;
type ResponderRow = typeof responders.$inferSelect;
type MeshRow = typeof meshNodes.$inferSelect;
type SosRow = typeof sosAlerts.$inferSelect;
type LogRow = typeof telemetryLogs.$inferSelect;

export function toIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    sector: row.sector,
    priority: row.priority as Incident['priority'],
    urgencyLabel: row.urgencyLabel,
    timeAgo: formatTimeAgo(row.createdAt),
    elapsedTime: formatElapsed(row.createdAt),
    description: row.description,
    status: row.status as Incident['status'],
    assignedAgency: row.assignedAgency ?? undefined,
    casualtiesEst: row.casualtiesEst,
    waterLevelRising: row.waterLevelRising,
    structuralRisk: row.structuralRisk as Incident['structuralRisk'],
    coordinates: { lat: row.lat, lng: row.lng },
    priorityScore: row.priorityScore,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toLog(row: LogRow): DataFeedLog {
  return {
    id: row.id,
    timestamp: row.timestampLabel,
    logText: row.logText,
    type: row.type as DataFeedLog['type'],
  };
}

export function toSos(row: SosRow): EmergencySOSPayload {
  return {
    id: row.id,
    timestamp: row.createdAt.toISOString(),
    type: row.type as EmergencySOSPayload['type'],
    location: { lat: row.lat, lng: row.lng, address: row.address },
    accuracyMeters: row.accuracyMeters,
    status: row.status as EmergencySOSPayload['status'],
    incidentId: row.incidentId ?? undefined,
  };
}

export function toResponder(row: ResponderRow): ResponderSafety {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    unit: row.unit,
    status: row.status as ResponderSafety['status'],
    battery: row.battery,
    heartRateBpm: row.heartRateBpm,
    lastCheckInSecAgo: Math.max(0, Math.floor((Date.now() - row.lastCheckInAt.getTime()) / 1000)),
    deadmanTimeoutSec: row.deadmanTimeoutSec,
    deadmanRemainingSec: remainingDeadmanSec(row.lastCheckInAt, row.deadmanTimeoutSec),
    hazardRisk: row.hazardRisk as ResponderSafety['hazardRisk'],
    coordinates: { lat: row.lat, lng: row.lng },
    assignedIncidentId: row.assignedIncidentId ?? undefined,
  };
}

export function toMeshNode(row: MeshRow): MeshNode {
  return {
    id: row.id,
    name: row.name,
    type: row.type as MeshNode['type'],
    status: row.status as MeshNode['status'],
    batteryLevel: row.batteryLevel,
    rssi: row.rssi,
    connectedPeers: row.connectedPeers,
    packetsRelayed: row.packetsRelayed,
    lastPing: formatRelativeShort(row.lastPingAt),
    coordinates: { lat: row.lat, lng: row.lng },
  };
}

export function toAgencyMatch(
  row: AgencyRow & { distanceKm: number; assigned: boolean; assignedLoad: number; matchScore: number }
): AgencyMatch {
  return {
    id: row.id,
    name: row.name,
    matchScore: row.matchScore,
    distanceKm: Math.round(row.distanceKm * 10) / 10,
    equipment: row.equipment ?? [],
    certifications: row.certifications ?? [],
    aerialSupport: row.aerialSupport,
    assigned: row.assigned,
    statusText: row.assigned ? 'AGENCY DISPATCHED' : row.statusText,
  };
}
