import type { PriorityLevel } from '../types/rescue';

export type StructuralRisk = 'Low' | 'Medium' | 'High' | 'Extreme';

export function urgencyLabelFor(priority: PriorityLevel): string {
  switch (priority) {
    case 'Crit-01':
      return 'Priority 0';
    case 'High-04':
      return 'Priority 1';
    case 'Med-12':
      return 'Priority 2';
    default:
      return 'Priority 3';
  }
}

export function priorityFromScore(score: number): PriorityLevel {
  if (score >= 80) return 'Crit-01';
  if (score >= 55) return 'High-04';
  if (score >= 30) return 'Med-12';
  return 'Low-20';
}

export function computePriorityScore(input: {
  casualtiesEst: number;
  waterLevelRising: boolean;
  structuralRisk: StructuralRisk;
  nearbySosCount: number;
  elapsedHours: number;
}): { priorityScore: number; priority: PriorityLevel; urgencyLabel: string } {
  const casualtyPts = Math.min(40, Math.max(0, input.casualtiesEst) * 2);
  const waterPts = input.waterLevelRising ? 20 : 0;
  const riskPts: Record<StructuralRisk, number> = {
    Low: 5,
    Medium: 10,
    High: 20,
    Extreme: 30,
  };
  const sosPts = Math.min(20, Math.max(0, input.nearbySosCount) * 5);
  const timePts = Math.min(10, Math.max(0, input.elapsedHours) * 2);
  const priorityScore = Math.min(
    100,
    Math.round(casualtyPts + waterPts + riskPts[input.structuralRisk] + sosPts + timePts)
  );
  const priority = priorityFromScore(priorityScore);
  return { priorityScore, priority, urgencyLabel: urgencyLabelFor(priority) };
}

export function computeMatchScore(input: {
  distanceKm: number;
  equipment: string[];
  certifications: string[];
  aerialSupport: number;
  assignedLoad: number;
  waterLevelRising: boolean;
}): number {
  let score = 92;
  score -= input.distanceKm * 4;
  const eq = input.equipment.join(' ').toLowerCase();
  const certs = input.certifications.join(' ').toLowerCase();
  if (input.waterLevelRising && (eq.includes('boat') || eq.includes('zodiac') || eq.includes('water'))) {
    score += 10;
  }
  if (eq.includes('helicopter') || input.aerialSupport > 0) {
    score += 8;
  }
  if (eq.includes('thermal') || eq.includes('medic')) {
    score += 4;
  }
  if (input.waterLevelRising && certs.includes('swift water')) {
    score += 8;
  }
  if (certs.includes('fire') && input.waterLevelRising) {
    score -= 12;
  }
  score -= input.assignedLoad * 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}
