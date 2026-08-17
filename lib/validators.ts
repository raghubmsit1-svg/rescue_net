import { z } from 'zod';

export const createIncidentSchema = z.object({
  title: z.string().min(1),
  location: z.string().min(1),
  sector: z.string().min(1),
  priority: z.enum(['Crit-01', 'High-04', 'Med-12', 'Low-20']).optional(),
  description: z.string().optional().default(''),
  casualtiesEst: z.number().int().min(0).optional().default(0),
  waterLevelRising: z.boolean().optional().default(false),
  structuralRisk: z.enum(['Low', 'Medium', 'High', 'Extreme']).optional().default('Medium'),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export const patchIncidentSchema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  sector: z.string().min(1).optional(),
  description: z.string().optional(),
  casualtiesEst: z.number().int().min(0).optional(),
  waterLevelRising: z.boolean().optional(),
  structuralRisk: z.enum(['Low', 'Medium', 'High', 'Extreme']).optional(),
  status: z.enum(['Pending', 'Dispatched', 'On Scene', 'Resolved']).optional(),
});

export const createSosSchema = z.object({
  type: z.enum(['Medical Help', 'Rescue Needed', 'Supplies', 'Hazard', 'General SOS']),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional().default(''),
  }),
  accuracyMeters: z.number().min(0).optional().default(10),
});

export const assignAgencySchema = z.object({
  agencyId: z.string().min(1),
});

export const heartbeatSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  battery: z.number().int().min(0).max(100).optional(),
  heartRateBpm: z.number().int().min(0).max(250).optional(),
  hazardRisk: z.enum(['Nominal', 'Moderate', 'Severe Risk']).optional(),
});

export const responderStatusSchema = z.object({
  status: z.enum(['En Route', 'On Scene', 'Cleared', 'Safe / On Task', 'Check-in Warning', 'SOS Alert', 'Rest Period']),
});

export const meshHeartbeatSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  type: z.enum(['LORA Relay', 'BLE Peer', 'Sat Gateway', 'Mobile Hotspot']).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
  rssi: z.number().optional(),
  connectedPeers: z.number().int().min(0).optional(),
  packetsRelayed: z.number().int().min(0).optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export const meshBroadcastSchema = z.object({
  payload: z.string().min(1),
  sender: z.string().optional(),
});
