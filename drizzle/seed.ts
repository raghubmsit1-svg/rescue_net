import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, closeDb } from '../lib/db';
import {
  agencies,
  dispatches,
  incidents,
  meshNodes,
  meshPackets,
  responders,
  telemetryLogs,
  users,
} from './schema';
import { computePriorityScore } from '../lib/scoring';

async function seed() {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, 'hq@rescuenet.local')).limit(1);
  if (existing.length > 0) {
    console.log('Database already seeded.');
    return;
  }

  const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD ?? 'rescuenet', 10);
  const now = Date.now();

  await db.insert(agencies).values([
    {
      id: 'AGY-98',
      name: 'Delta Rescue Squad',
      equipment: ['Zodiac Boats: 3', 'Swift Water Gear', 'Thermal Scanners'],
      certifications: ['Swift Water Certified', 'Hazmat Level 2'],
      aerialSupport: 0,
      statusText: 'Ready for Immediate Deployment',
      lat: 9.512,
      lng: 76.351,
    },
    {
      id: 'AGY-85',
      name: 'Coastal Guard Unit B',
      equipment: ['Helicopter: 1', 'Heavy Rescue Winch', 'Emergency Medics'],
      certifications: ['Air-Sea Evacuation', 'Trauma Resuscitation'],
      aerialSupport: 1,
      statusText: 'Airbase Standby',
      lat: 9.535,
      lng: 76.372,
    },
    {
      id: 'AGY-62',
      name: 'Local Fire Dept 12',
      equipment: ['Pumper Truck: 2', 'Ladders: 4'],
      certifications: ['Fire Suppression'],
      aerialSupport: 0,
      statusText: 'Limited Flood Equipment (No Watercraft)',
      lat: 9.504,
      lng: 76.344,
    },
    {
      id: 'AGY-NDRF',
      name: 'National Disaster Response Force (NDRF)',
      equipment: ['Heavy Equipment', 'Search Cameras', 'Boats: 6'],
      certifications: ['Urban Search and Rescue', 'Swift Water Certified'],
      aerialSupport: 2,
      statusText: 'Deployed — Munnar Pass 3',
      lat: 10.09,
      lng: 77.06,
    },
  ]);

  await db.insert(responders).values([
    {
      id: 'RESP-401',
      name: 'Capt. Rajesh Nair',
      role: 'Team Lead / Boat Pilot',
      unit: 'NDRF Unit 4',
      agencyId: 'AGY-NDRF',
      status: 'Safe / On Task',
      battery: 85,
      heartRateBpm: 78,
      lastCheckInAt: new Date(now - 140_000),
      deadmanTimeoutSec: 1800,
      hazardRisk: 'Moderate',
      lat: 9.4981,
      lng: 76.3388,
      assignedIncidentId: 'INC-1024',
    },
    {
      id: 'RESP-402',
      name: 'Dr. Ananya Varma',
      role: 'Trauma Medic',
      unit: 'EMS Swift Response',
      agencyId: 'AGY-85',
      status: 'Safe / On Task',
      battery: 92,
      heartRateBpm: 84,
      lastCheckInAt: new Date(now - 320_000),
      deadmanTimeoutSec: 1800,
      hazardRisk: 'Nominal',
      lat: 9.5012,
      lng: 76.3421,
      assignedIncidentId: 'INC-1024',
    },
    {
      id: 'RESP-403',
      name: 'Sgt. Vikram Singh',
      role: 'Swift Water Diver',
      unit: 'Coast Guard Air Sea',
      agencyId: 'AGY-85',
      status: 'Check-in Warning',
      battery: 28,
      heartRateBpm: 118,
      lastCheckInAt: new Date(now - 1_650_000),
      deadmanTimeoutSec: 1800,
      hazardRisk: 'Severe Risk',
      lat: 11.6854,
      lng: 76.132,
      assignedIncidentId: 'INC-1025',
    },
    {
      id: 'RESP-404',
      name: 'Officer Thomas Kurien',
      role: 'Equipment Operator',
      unit: 'Fire Dept 12',
      agencyId: 'AGY-62',
      status: 'Safe / On Task',
      battery: 74,
      heartRateBpm: 72,
      lastCheckInAt: new Date(now - 600_000),
      deadmanTimeoutSec: 1800,
      hazardRisk: 'Moderate',
      lat: 10.0889,
      lng: 77.0595,
      assignedIncidentId: 'INC-1028',
    },
  ]);

  await db.insert(users).values([
    {
      id: 'USR-HQ',
      email: 'hq@rescuenet.local',
      passwordHash,
      name: 'HQ Alpha',
      role: 'hq',
    },
    {
      id: 'USR-RESP',
      email: 'responder@rescuenet.local',
      passwordHash,
      name: 'Capt. Rajesh Nair',
      role: 'responder',
      agencyId: 'AGY-NDRF',
      responderId: 'RESP-401',
    },
    {
      id: 'USR-CIV',
      email: 'civilian@rescuenet.local',
      passwordHash,
      name: 'Civilian Reporter',
      role: 'civilian',
    },
  ]);

  const incidentRows = [
    {
      id: 'INC-1024',
      title: 'Flooded Building - Ground Floor Breach',
      location: 'Alappuzha District, Sector 4',
      sector: 'Sector 4',
      description:
        'Local sensors indicate water levels have breached the ground floor. 3 distress calls received from coordinates within building block. Power grid offline.',
      status: 'Pending' as const,
      casualtiesEst: 15,
      waterLevelRising: true,
      structuralRisk: 'High' as const,
      lat: 9.4981,
      lng: 76.3388,
      createdAt: new Date(now - 2 * 60_000),
    },
    {
      id: 'INC-1025',
      title: 'Airlift Req: Wayanad Sector 7',
      location: 'Wayanad Hills, Sector 7',
      sector: 'Sector 7',
      description:
        'Flash flood isolating 45 civilians in elevated tea plantation shelter. Road access completely severed by mudslide.',
      status: 'Pending' as const,
      casualtiesEst: 45,
      waterLevelRising: true,
      structuralRisk: 'Extreme' as const,
      lat: 11.6854,
      lng: 76.132,
      createdAt: new Date(now - 5 * 60_000),
    },
    {
      id: 'INC-1026',
      title: 'Supply Drop: Alappuzha Relief Camp',
      location: 'Central Relief Hub, Alappuzha',
      sector: 'Sector 4',
      description:
        'Relief camp housing 180 evacuees running critically low on pediatric medical supplies and clean drinking water. Drone payload drop requested.',
      status: 'Pending' as const,
      casualtiesEst: 0,
      waterLevelRising: false,
      structuralRisk: 'Medium' as const,
      lat: 9.5012,
      lng: 76.3421,
      createdAt: new Date(now - 15 * 60_000),
    },
    {
      id: 'INC-1027',
      title: 'Idukki Dam Breach Evacuation',
      location: 'Idukki Catchment Basin, Zone B',
      sector: 'Zone B',
      description:
        'Emergency spillway warning issued. Immediate forced evacuation of 3 low-lying villages along Periyar riverbank required within T-minus 15M.',
      status: 'Pending' as const,
      casualtiesEst: 120,
      waterLevelRising: true,
      structuralRisk: 'Extreme' as const,
      lat: 9.8482,
      lng: 76.9744,
      createdAt: new Date(now - 22 * 60_000),
    },
    {
      id: 'INC-1028',
      title: 'Munnar Landslide Evacuation',
      location: 'Munnar Valley Road, Pass 3',
      sector: 'Pass 3',
      description:
        'Hillside collapse blocking state highway 17. 4 vehicles trapped in debris zone. Heavy equipment clearing team dispatched.',
      status: 'Dispatched' as const,
      assignedAgency: 'National Disaster Response Force (NDRF)',
      casualtiesEst: 8,
      waterLevelRising: false,
      structuralRisk: 'High' as const,
      lat: 10.0889,
      lng: 77.0595,
      createdAt: new Date(now - 40 * 60_000),
    },
    {
      id: 'INC-1029',
      title: 'Comms Grid Restored: Sector 2',
      location: 'Kottayam Operational Hub',
      sector: 'Sector 2',
      description:
        'Tactical mobile satellite relay active. VHF rescue channels back online across Sector 2 telemetry grid.',
      status: 'Resolved' as const,
      casualtiesEst: 0,
      waterLevelRising: false,
      structuralRisk: 'Low' as const,
      lat: 9.5916,
      lng: 76.5222,
      createdAt: new Date(now - 60 * 60_000),
    },
  ];

  await db.insert(incidents).values(
    incidentRows.map((row) => {
      const scored = computePriorityScore({
        casualtiesEst: row.casualtiesEst,
        waterLevelRising: row.waterLevelRising,
        structuralRisk: row.structuralRisk,
        nearbySosCount: row.id === 'INC-1024' ? 3 : 0,
        elapsedHours: (now - row.createdAt.getTime()) / 3_600_000,
      });
      return {
        ...row,
        priority: scored.priority,
        urgencyLabel: scored.urgencyLabel,
        priorityScore: scored.priorityScore,
        updatedAt: row.createdAt,
      };
    })
  );

  await db.insert(dispatches).values({
    id: 'DSP-1028',
    incidentId: 'INC-1028',
    agencyId: 'AGY-NDRF',
    assignedBy: 'USR-HQ',
    assignedAt: new Date(now - 35 * 60_000),
  });

  await db.insert(telemetryLogs).values([
    {
      id: 'LOG-1442',
      timestampLabel: '14:42 IST',
      logText: 'Aerial drone pass confirms roof occupancy: Negative.',
      type: 'drone',
      incidentId: 'INC-1024',
      createdAt: new Date(now - 10 * 60_000),
    },
    {
      id: 'LOG-1445',
      timestampLabel: '14:45 IST',
      logText: 'Submergence depth est: 2.4 meters at ground level.',
      type: 'sensor',
      incidentId: 'INC-1024',
      createdAt: new Date(now - 7 * 60_000),
    },
    {
      id: 'LOG-1448',
      timestampLabel: '14:48 IST',
      logText: 'Distress ping received via Victim SOS Portal from coordinates (9.4981, 76.3388).',
      type: 'call',
      incidentId: 'INC-1024',
      createdAt: new Date(now - 4 * 60_000),
    },
    {
      id: 'LOG-1450',
      timestampLabel: '14:50 IST',
      logText: 'AI Priority Score recalculated: Upgraded to 91/100 (CRITICAL).',
      type: 'system',
      incidentId: 'INC-1024',
      createdAt: new Date(now - 2 * 60_000),
    },
  ]);

  await db.insert(meshNodes).values([
    {
      id: 'NODE-ALAP-01',
      name: 'Alappuzha High Ground Tower',
      type: 'LORA Relay',
      status: 'Active',
      batteryLevel: 94,
      rssi: -62,
      connectedPeers: 18,
      packetsRelayed: 1420,
      lastPingAt: new Date(now - 2_000),
      lat: 9.4981,
      lng: 76.3388,
    },
    {
      id: 'NODE-WAYA-04',
      name: 'Wayanad Ridge Relay B',
      type: 'Sat Gateway',
      status: 'Active',
      batteryLevel: 88,
      rssi: -71,
      connectedPeers: 12,
      packetsRelayed: 980,
      lastPingAt: new Date(now - 5_000),
      lat: 11.6854,
      lng: 76.132,
    },
    {
      id: 'NODE-IDUK-09',
      name: 'Idukki Catchment Mesh Repeater',
      type: 'LORA Relay',
      status: 'Degraded',
      batteryLevel: 42,
      rssi: -94,
      connectedPeers: 6,
      packetsRelayed: 430,
      lastPingAt: new Date(now - 90_000),
      lat: 9.8482,
      lng: 76.9744,
    },
    {
      id: 'NODE-MUNN-02',
      name: 'Munnar Mobile Command Van',
      type: 'Mobile Hotspot',
      status: 'Active',
      batteryLevel: 100,
      rssi: -54,
      connectedPeers: 24,
      packetsRelayed: 3100,
      lastPingAt: new Date(now - 1_000),
      lat: 10.0889,
      lng: 77.0595,
    },
    {
      id: 'NODE-KOTT-07',
      name: 'Kottayam Sector 2 Peer Node',
      type: 'BLE Peer',
      status: 'Offline',
      batteryLevel: 0,
      rssi: -120,
      connectedPeers: 0,
      packetsRelayed: 120,
      lastPingAt: new Date(now - 45 * 60_000),
      lat: 9.5916,
      lng: 76.5222,
    },
  ]);

  await db.insert(meshPackets).values([
    {
      id: 'PKT-9901',
      sender: 'Victim Mobile #8812',
      payload: 'SOS Medical: Chest Pain & High Water in Alappuzha Sector 4',
      hops: 2,
      createdAt: new Date(now - 60_000),
    },
    {
      id: 'PKT-9898',
      sender: 'Responder NDRF Unit 4',
      payload: 'Relay Beacon Ping: Water levels stabilized near Bridge 2',
      hops: 1,
      createdAt: new Date(now - 3 * 60_000),
    },
    {
      id: 'PKT-9892',
      sender: 'Wayanad Ridge Node',
      payload: 'Landslide Warning: Heavy rainfall triggers mud movement',
      hops: 3,
      createdAt: new Date(now - 8 * 60_000),
    },
  ]);

  console.log('Seed complete. Demo logins:');
  console.log('  hq@rescuenet.local / ' + (process.env.SEED_PASSWORD ?? 'rescuenet'));
  console.log('  responder@rescuenet.local / ' + (process.env.SEED_PASSWORD ?? 'rescuenet'));
  console.log('  civilian@rescuenet.local / ' + (process.env.SEED_PASSWORD ?? 'rescuenet'));
}

seed()
  .then(async () => {
    await closeDb();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await closeDb();
    process.exit(1);
  });
