import { Incident, AgencyMatch, DataFeedLog, MeshNode, ResponderSafety } from '../types/rescue';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-1024',
    title: 'Flooded Building - Ground Floor Breach',
    location: 'Alappuzha District, Sector 4',
    sector: 'Sector 4',
    priority: 'Crit-01',
    urgencyLabel: 'Priority 0',
    timeAgo: '02M Ago',
    elapsedTime: '04:22 Elapsed',
    description: 'Local sensors indicate water levels have breached the ground floor. 3 distress calls received from coordinates within building block. Power grid offline.',
    status: 'Pending',
    casualtiesEst: 15,
    waterLevelRising: true,
    structuralRisk: 'High',
    coordinates: { lat: 9.4981, lng: 76.3388 },
  },
  {
    id: 'INC-1025',
    title: 'Airlift Req: Wayanad Sector 7',
    location: 'Wayanad Hills, Sector 7',
    sector: 'Sector 7',
    priority: 'Crit-01',
    urgencyLabel: 'Priority 0',
    timeAgo: '05M Ago',
    elapsedTime: '12:40 Elapsed',
    description: 'Flash flood isolating 45 civilians in elevated tea plantation shelter. Road access completely severed by mudslide.',
    status: 'Pending',
    casualtiesEst: 45,
    waterLevelRising: true,
    structuralRisk: 'Extreme',
    coordinates: { lat: 11.6854, lng: 76.1320 },
  },
  {
    id: 'INC-1026',
    title: 'Supply Drop: Alappuzha Relief Camp',
    location: 'Central Relief Hub, Alappuzha',
    sector: 'Sector 4',
    priority: 'High-04',
    urgencyLabel: 'Priority 1',
    timeAgo: '15M Ago',
    elapsedTime: '28:10 Elapsed',
    description: 'Relief camp housing 180 evacuees running critically low on pediatric medical supplies and clean drinking water. Drone payload drop requested.',
    status: 'Pending',
    casualtiesEst: 0,
    waterLevelRising: false,
    structuralRisk: 'Medium',
    coordinates: { lat: 9.5012, lng: 76.3421 },
  },
  {
    id: 'INC-1027',
    title: 'Idukki Dam Breach Evacuation',
    location: 'Idukki Catchment Basin, Zone B',
    sector: 'Zone B',
    priority: 'Crit-01',
    urgencyLabel: 'Priority 0',
    timeAgo: '22M Ago',
    elapsedTime: '45:00 Elapsed',
    description: 'Emergency spillway warning issued. Immediate forced evacuation of 3 low-lying villages along Periyar riverbank required within T-minus 15M.',
    status: 'Pending',
    casualtiesEst: 120,
    waterLevelRising: true,
    structuralRisk: 'Extreme',
    coordinates: { lat: 9.8482, lng: 76.9744 },
  },
  {
    id: 'INC-1028',
    title: 'Munnar Landslide Evacuation',
    location: 'Munnar Valley Road, Pass 3',
    sector: 'Pass 3',
    priority: 'High-04',
    urgencyLabel: 'Priority 1',
    timeAgo: '40M Ago',
    elapsedTime: '01:15:00',
    description: 'Hillside collapse blocking state highway 17. 4 vehicles trapped in debris zone. Heavy equipment clearing team dispatched.',
    status: 'Dispatched',
    assignedAgency: 'National Disaster Response Force (NDRF)',
    casualtiesEst: 8,
    waterLevelRising: false,
    structuralRisk: 'High',
    coordinates: { lat: 10.0889, lng: 77.0595 },
  },
  {
    id: 'INC-1029',
    title: 'Comms Grid Restored: Sector 2',
    location: 'Kottayam Operational Hub',
    sector: 'Sector 2',
    priority: 'Med-12',
    urgencyLabel: 'Priority 2',
    timeAgo: '1H Ago',
    elapsedTime: '02:05:00',
    description: 'Tactical mobile satellite relay active. VHF rescue channels back online across Sector 2 telemetry grid.',
    status: 'Resolved',
    casualtiesEst: 0,
    waterLevelRising: false,
    structuralRisk: 'Low',
    coordinates: { lat: 9.5916, lng: 76.5222 },
  }
];

export const INITIAL_AGENCY_MATCHES: AgencyMatch[] = [
  {
    id: 'AGY-98',
    name: 'Delta Rescue Squad',
    matchScore: 98,
    distanceKm: 2.4,
    equipment: ['Zodiac Boats: 3', 'Swift Water Gear', 'Thermal Scanners'],
    certifications: ['Swift Water Certified', 'Hazmat Level 2'],
    aerialSupport: 0,
    assigned: false,
    statusText: 'Ready for Immediate Deployment'
  },
  {
    id: 'AGY-85',
    name: 'Coastal Guard Unit B',
    matchScore: 85,
    distanceKm: 5.1,
    equipment: ['Helicopter: 1', 'Heavy Rescue Winch', 'Emergency Medics'],
    certifications: ['Air-Sea Evacuation', 'Trauma Resuscitation'],
    aerialSupport: 1,
    assigned: false,
    statusText: 'Airbase Standby'
  },
  {
    id: 'AGY-62',
    name: 'Local Fire Dept 12',
    matchScore: 62,
    distanceKm: 0.8,
    equipment: ['Pumper Truck: 2', 'Ladders: 4'],
    certifications: ['Fire Suppression'],
    aerialSupport: 0,
    assigned: false,
    statusText: 'Limited Flood Equipment (No Watercraft)'
  }
];

export const INITIAL_DATA_FEED_LOGS: DataFeedLog[] = [
  {
    id: 'LOG-1442',
    timestamp: '14:42 IST',
    logText: 'Aerial drone pass confirms roof occupancy: Negative.',
    type: 'drone'
  },
  {
    id: 'LOG-1445',
    timestamp: '14:45 IST',
    logText: 'Submergence depth est: 2.4 meters at ground level.',
    type: 'sensor'
  },
  {
    id: 'LOG-1448',
    timestamp: '14:48 IST',
    logText: 'Distress ping received via Victim SOS Portal from coordinates (9.4981, 76.3388).',
    type: 'call'
  },
  {
    id: 'LOG-1450',
    timestamp: '14:50 IST',
    logText: 'AI Priority Score recalculated: Upgraded to 91/100 (CRITICAL).',
    type: 'system'
  }
];

export const INITIAL_MESH_NODES: MeshNode[] = [
  {
    id: 'NODE-ALAP-01',
    name: 'Alappuzha High Ground Tower',
    type: 'LORA Relay',
    status: 'Active',
    batteryLevel: 94,
    rssi: -62,
    connectedPeers: 18,
    packetsRelayed: 1420,
    lastPing: '2s ago',
    coordinates: { lat: 9.4981, lng: 76.3388 }
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
    lastPing: '5s ago',
    coordinates: { lat: 11.6854, lng: 76.1320 }
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
    lastPing: '18s ago',
    coordinates: { lat: 9.8482, lng: 76.9744 }
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
    lastPing: '1s ago',
    coordinates: { lat: 10.0889, lng: 77.0595 }
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
    lastPing: '45m ago',
    coordinates: { lat: 9.5916, lng: 76.5222 }
  }
];

export const INITIAL_RESPONDER_SAFETY: ResponderSafety[] = [
  {
    id: 'RESP-401',
    name: 'Capt. Rajesh Nair',
    role: 'Team Lead / Boat Pilot',
    unit: 'NDRF Unit 4',
    status: 'Safe / On Task',
    battery: 85,
    heartRateBpm: 78,
    lastCheckInSecAgo: 140,
    deadmanTimeoutSec: 1800,
    hazardRisk: 'Moderate',
    coordinates: { lat: 9.4981, lng: 76.3388 }
  },
  {
    id: 'RESP-402',
    name: 'Dr. Ananya Varma',
    role: 'Trauma Medic',
    unit: 'EMS Swift Response',
    status: 'Safe / On Task',
    battery: 92,
    heartRateBpm: 84,
    lastCheckInSecAgo: 320,
    deadmanTimeoutSec: 1800,
    hazardRisk: 'Nominal',
    coordinates: { lat: 9.5012, lng: 76.3421 }
  },
  {
    id: 'RESP-403',
    name: 'Sgt. Vikram Singh',
    role: 'Swift Water Diver',
    unit: 'Coast Guard Air Sea',
    status: 'Check-in Warning',
    battery: 28,
    heartRateBpm: 118,
    lastCheckInSecAgo: 1650,
    deadmanTimeoutSec: 1800,
    hazardRisk: 'Severe Risk',
    coordinates: { lat: 11.6854, lng: 76.1320 }
  },
  {
    id: 'RESP-404',
    name: 'Officer Thomas Kurien',
    role: 'Equipment Operator',
    unit: 'Fire Dept 12',
    status: 'Safe / On Task',
    battery: 74,
    heartRateBpm: 72,
    lastCheckInSecAgo: 600,
    deadmanTimeoutSec: 1800,
    hazardRisk: 'Moderate',
    coordinates: { lat: 10.0889, lng: 77.0595 }
  }
];

