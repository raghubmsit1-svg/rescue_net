import { Incident, AgencyMatch, DataFeedLog } from '../types/rescue';

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
