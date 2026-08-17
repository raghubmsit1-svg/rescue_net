import {
  pgTable,
  text,
  integer,
  boolean,
  doublePrecision,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const agencies = pgTable(
  'agencies',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    equipment: text('equipment').array().notNull().default([]),
    certifications: text('certifications').array().notNull().default([]),
    aerialSupport: integer('aerial_support').notNull().default(0),
    statusText: text('status_text').notNull().default('Available'),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('agencies_status_idx').on(t.statusText)]
);

export const responders = pgTable(
  'responders',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    role: text('role').notNull(),
    unit: text('unit').notNull(),
    agencyId: text('agency_id').references(() => agencies.id),
    status: text('status').notNull().default('Safe / On Task'),
    battery: integer('battery').notNull().default(100),
    heartRateBpm: integer('heart_rate_bpm').notNull().default(72),
    lastCheckInAt: timestamp('last_check_in_at', { withTimezone: true }).defaultNow().notNull(),
    deadmanTimeoutSec: integer('deadman_timeout_sec').notNull().default(1800),
    hazardRisk: text('hazard_risk').notNull().default('Nominal'),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    assignedIncidentId: text('assigned_incident_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('responders_status_idx').on(t.status),
    index('responders_checkin_idx').on(t.lastCheckInAt),
  ]
);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  agencyId: text('agency_id').references(() => agencies.id),
  responderId: text('responder_id').references(() => responders.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const incidents = pgTable(
  'incidents',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    location: text('location').notNull(),
    sector: text('sector').notNull(),
    priority: text('priority').notNull(),
    urgencyLabel: text('urgency_label').notNull(),
    description: text('description').notNull().default(''),
    status: text('status').notNull().default('Pending'),
    assignedAgency: text('assigned_agency'),
    casualtiesEst: integer('casualties_est').notNull().default(0),
    waterLevelRising: boolean('water_level_rising').notNull().default(false),
    structuralRisk: text('structural_risk').notNull().default('Medium'),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    priorityScore: integer('priority_score').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('incidents_status_idx').on(t.status),
    index('incidents_priority_idx').on(t.priority),
  ]
);

export const sosAlerts = pgTable(
  'sos_alerts',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    address: text('address').notNull().default(''),
    accuracyMeters: integer('accuracy_meters').notNull().default(10),
    status: text('status').notNull().default('Received'),
    incidentId: text('incident_id').references(() => incidents.id),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('sos_incident_idx').on(t.incidentId), index('sos_status_idx').on(t.status)]
);

export const dispatches = pgTable('dispatches', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id')
    .notNull()
    .references(() => incidents.id),
  agencyId: text('agency_id')
    .notNull()
    .references(() => agencies.id),
  assignedBy: text('assigned_by'),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
});

export const meshNodes = pgTable(
  'mesh_nodes',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    status: text('status').notNull().default('Active'),
    batteryLevel: integer('battery_level').notNull().default(100),
    rssi: integer('rssi').notNull().default(-70),
    connectedPeers: integer('connected_peers').notNull().default(0),
    packetsRelayed: integer('packets_relayed').notNull().default(0),
    lastPingAt: timestamp('last_ping_at', { withTimezone: true }).defaultNow().notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
  },
  (t) => [
    index('mesh_nodes_status_idx').on(t.status),
    index('mesh_nodes_ping_idx').on(t.lastPingAt),
  ]
);

export const meshPackets = pgTable(
  'mesh_packets',
  {
    id: text('id').primaryKey(),
    sender: text('sender').notNull(),
    payload: text('payload').notNull(),
    hops: integer('hops').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('mesh_packets_created_idx').on(t.createdAt)]
);

export const telemetryLogs = pgTable(
  'telemetry_logs',
  {
    id: text('id').primaryKey(),
    timestampLabel: text('timestamp_label').notNull(),
    logText: text('log_text').notNull(),
    type: text('type').notNull(),
    incidentId: text('incident_id').references(() => incidents.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('telemetry_incident_idx').on(t.incidentId)]
);
