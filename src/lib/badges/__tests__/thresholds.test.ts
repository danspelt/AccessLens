import { describe, expect, it } from 'vitest';
import {
  BADGE_THRESHOLDS,
  buildBadgeProgress,
  computeEarnedBadges,
  type BadgeCounts,
} from '@/lib/badges/awardBadges';

const empty: BadgeCounts = {
  placesVisited: 0,
  reviewCount: 0,
  placesAdded: 0,
  photosUploaded: 0,
  verifiedReviewCount: 0,
};

describe('computeEarnedBadges', () => {
  it('returns nothing below thresholds', () => {
    expect(computeEarnedBadges(empty)).toEqual([]);
    expect(
      computeEarnedBadges({
        ...empty,
        placesVisited: BADGE_THRESHOLDS.explorer - 1,
        reviewCount: BADGE_THRESHOLDS.accessibility_hero - 1,
      })
    ).toEqual([]);
  });

  it('awards each badge at its threshold', () => {
    expect(
      computeEarnedBadges({
        placesVisited: 5,
        reviewCount: 25,
        placesAdded: 10,
        photosUploaded: 20,
        verifiedReviewCount: 1,
      }).sort()
    ).toEqual(
      [
        'accessibility_hero',
        'city_mapper',
        'explorer',
        'photo_contributor',
        'verified_reviewer',
      ].sort()
    );
  });
});

describe('buildBadgeProgress', () => {
  it('reports progress fractions capped at 1', () => {
    const progress = buildBadgeProgress(
      { ...empty, placesVisited: 10, reviewCount: 5 },
      ['explorer']
    );
    const explorer = progress.find((b) => b.id === 'explorer');
    const hero = progress.find((b) => b.id === 'accessibility_hero');
    expect(explorer?.earned).toBe(true);
    expect(explorer?.progress).toBe(1);
    expect(hero?.earned).toBe(false);
    expect(hero?.progress).toBeCloseTo(5 / 25);
  });
});
