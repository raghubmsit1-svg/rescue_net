CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS agencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  equipment TEXT[] NOT NULL DEFAULT '{}',
  certifications TEXT[] NOT NULL DEFAULT '{}',
  aerial_support INTEGER NOT NULL DEFAULT 0,
  status_text TEXT NOT NULL DEFAULT 'Available',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  unit TEXT NOT NULL,
  agency_id TEXT REFERENCES agencies(id),
  status TEXT NOT NULL DEFAULT 'Safe / On Task',
  battery INTEGER NOT NULL DEFAULT 100,
  heart_rate_bpm INTEGER NOT NULL DEFAULT 72,
  last_check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deadman_timeout_sec INTEGER NOT NULL DEFAULT 1800,
  hazard_risk TEXT NOT NULL DEFAULT 'Nominal',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  assigned_incident_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  agency_id TEXT REFERENCES agencies(id),
  responder_id TEXT REFERENCES responders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  sector TEXT NOT NULL,
  priority TEXT NOT NULL,
  urgency_label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending',
  assigned_agency TEXT,
  casualties_est INTEGER NOT NULL DEFAULT 0,
  water_level_rising BOOLEAN NOT NULL DEFAULT FALSE,
  structural_risk TEXT NOT NULL DEFAULT 'Medium',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  priority_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sos_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  accuracy_meters INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'Received',
  incident_id TEXT REFERENCES incidents(id),
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispatches (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL REFERENCES incidents(id),
  agency_id TEXT NOT NULL REFERENCES agencies(id),
  assigned_by TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mesh_nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  battery_level INTEGER NOT NULL DEFAULT 100,
  rssi INTEGER NOT NULL DEFAULT -70,
  connected_peers INTEGER NOT NULL DEFAULT 0,
  packets_relayed INTEGER NOT NULL DEFAULT 0,
  last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS mesh_packets (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL,
  payload TEXT NOT NULL,
  hops INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry_logs (
  id TEXT PRIMARY KEY,
  timestamp_label TEXT NOT NULL,
  log_text TEXT NOT NULL,
  type TEXT NOT NULL,
  incident_id TEXT REFERENCES incidents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agencies_status_idx ON agencies (status_text);
CREATE INDEX IF NOT EXISTS responders_status_idx ON responders (status);
CREATE INDEX IF NOT EXISTS responders_checkin_idx ON responders (last_check_in_at);
CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents (status);
CREATE INDEX IF NOT EXISTS incidents_priority_idx ON incidents (priority);
CREATE INDEX IF NOT EXISTS sos_incident_idx ON sos_alerts (incident_id);
CREATE INDEX IF NOT EXISTS sos_status_idx ON sos_alerts (status);
CREATE INDEX IF NOT EXISTS mesh_nodes_status_idx ON mesh_nodes (status);
CREATE INDEX IF NOT EXISTS mesh_nodes_ping_idx ON mesh_nodes (last_ping_at);
CREATE INDEX IF NOT EXISTS mesh_packets_created_idx ON mesh_packets (created_at);
CREATE INDEX IF NOT EXISTS telemetry_incident_idx ON telemetry_logs (incident_id);

CREATE INDEX IF NOT EXISTS incidents_geo_idx ON incidents USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
);
CREATE INDEX IF NOT EXISTS agencies_geo_idx ON agencies USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
);
CREATE INDEX IF NOT EXISTS sos_geo_idx ON sos_alerts USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
);
CREATE INDEX IF NOT EXISTS responders_geo_idx ON responders USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
);
CREATE INDEX IF NOT EXISTS mesh_nodes_geo_idx ON mesh_nodes USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
);
