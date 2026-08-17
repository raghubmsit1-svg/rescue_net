export const ALAPPUZHA = { lat: 9.4981, lng: 76.3388 };

export const SECTOR_COORDS: { match: string; lat: number; lng: number }[] = [
  { match: 'sector 4', lat: 9.4981, lng: 76.3388 },
  { match: 'alappuzha', lat: 9.4981, lng: 76.3388 },
  { match: 'sector 7', lat: 11.6854, lng: 76.132 },
  { match: 'wayanad', lat: 11.6854, lng: 76.132 },
  { match: 'pass 3', lat: 10.0889, lng: 77.0595 },
  { match: 'munnar', lat: 10.0889, lng: 77.0595 },
  { match: 'zone b', lat: 9.8482, lng: 76.9744 },
  { match: 'idukki', lat: 9.8482, lng: 76.9744 },
  { match: 'sector 2', lat: 9.5916, lng: 76.5222 },
  { match: 'kottayam', lat: 9.5916, lng: 76.5222 },
];

export function coordsForSector(sector: string, location = ''): { lat: number; lng: number } {
  const hay = `${sector} ${location}`.toLowerCase();
  const hit = SECTOR_COORDS.find((s) => hay.includes(s.match));
  if (hit) return { lat: hit.lat, lng: hit.lng };
  return { ...ALAPPUZHA };
}

export function mapSosCategory(label: string): 'Medical Help' | 'Rescue Needed' | 'Supplies' | 'Hazard' | 'General SOS' {
  const t = label.toLowerCase();
  if (t.includes('medical')) return 'Medical Help';
  if (t.includes('evac') || t.includes('rescue') || t.includes('boat') || t.includes('water')) return 'Rescue Needed';
  if (t.includes('supply') || t.includes('food')) return 'Supplies';
  if (t.includes('hazard') || t.includes('fire') || t.includes('structural')) return 'Hazard';
  return 'General SOS';
}
