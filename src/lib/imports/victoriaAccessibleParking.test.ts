import { describe, expect, it } from 'vitest';
import { toVictoriaParkingCandidate, type VictoriaParkingFeature } from './victoriaAccessibleParking';

describe('toVictoriaParkingCandidate', () => {
  it('keeps official attributes separate and marks the record for community verification', () => {
    const feature: VictoriaParkingFeature = {
      type: 'Feature', geometry: { type: 'Point', coordinates: [-123.36, 48.42] },
      properties: { OBJECTID: 64, InfrastructureID: 'PSP000333', CivicAddress: '1402 Broad St', Location: 'Broad 1400 Block', AccessAisle: 'Yes' },
    };
    const candidate = toVictoriaParkingCandidate(feature, '2026-08-16T00:00:00.000Z');
    expect(candidate.status).toBe('pending_community_verification');
    expect(candidate.address).toBe('1402 Broad St, Victoria, BC');
    expect(candidate.provenance.recordId).toBe('PSP000333');
    expect(candidate.officialAttributes.AccessAisle).toBe('Yes');
    expect(candidate.disclaimer).toContain('not a guarantee');
  });
});
