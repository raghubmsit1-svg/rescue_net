import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeMatchScore, computePriorityScore, priorityFromScore } from './scoring';

describe('computePriorityScore', () => {
  it('scores a critical flooded building as Crit-01', () => {
    const result = computePriorityScore({
      casualtiesEst: 15,
      waterLevelRising: true,
      structuralRisk: 'High',
      nearbySosCount: 3,
      elapsedHours: 0.1,
    });
    assert.equal(result.priority, 'Crit-01');
    assert.ok(result.priorityScore >= 80);
  });

  it('scores a resolved comms restore as low/medium', () => {
    const result = computePriorityScore({
      casualtiesEst: 0,
      waterLevelRising: false,
      structuralRisk: 'Low',
      nearbySosCount: 0,
      elapsedHours: 1,
    });
    assert.ok(result.priorityScore < 55);
    assert.ok(['Med-12', 'Low-20'].includes(result.priority));
  });
});

describe('priorityFromScore', () => {
  it('maps bands', () => {
    assert.equal(priorityFromScore(91), 'Crit-01');
    assert.equal(priorityFromScore(60), 'High-04');
    assert.equal(priorityFromScore(40), 'Med-12');
    assert.equal(priorityFromScore(10), 'Low-20');
  });
});

describe('computeMatchScore', () => {
  it('ranks boats higher than fire trucks for rising water', () => {
    const boats = computeMatchScore({
      distanceKm: 2.4,
      equipment: ['Zodiac Boats: 3', 'Swift Water Gear'],
      certifications: ['Swift Water Certified'],
      aerialSupport: 0,
      assignedLoad: 0,
      waterLevelRising: true,
    });
    const fire = computeMatchScore({
      distanceKm: 0.8,
      equipment: ['Pumper Truck: 2'],
      certifications: ['Fire Suppression'],
      aerialSupport: 0,
      assignedLoad: 0,
      waterLevelRising: true,
    });
    assert.ok(boats > fire);
    assert.ok(boats >= 85);
  });
});
