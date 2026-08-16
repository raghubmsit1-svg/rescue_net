export type PriorityLevel = 'Crit-01' | 'High-04' | 'Med-12' | 'Low-20';

export interface Incident {
  id: string;
  title: string;
  location: string;
  sector: string;
  priority: PriorityLevel;
  urgencyLabel: string;
  timeAgo: string;
  elapsedTime?: string;
  description: string;
  status: 'Pending' | 'Dispatched' | 'On Scene' | 'Resolved';
  assignedAgency?: string;
  casualtiesEst: number;
  waterLevelRising: boolean;
  structuralRisk: 'Low' | 'Medium' | 'High' | 'Extreme';
  coordinates: { lat: number; lng: number };
}

export interface AgencyMatch {
  id: string;
  name: string;
  matchScore: number;
  distanceKm: number;
  equipment: string[];
  certifications: string[];
  aerialSupport: number;
  assigned: boolean;
  statusText: string;
}

export interface DataFeedLog {
  id: string;
  timestamp: string;
  logText: string;
  type: 'drone' | 'sensor' | 'call' | 'system';
}

export interface EmergencySOSPayload {
  id: string;
  timestamp: string;
  type: 'Medical Help' | 'Rescue Needed' | 'Supplies' | 'Hazard' | 'General SOS';
  location: { lat: number; lng: number; address: string };
  accuracyMeters: number;
  status: 'Received' | 'Unit En Route' | 'Resolved';
}
