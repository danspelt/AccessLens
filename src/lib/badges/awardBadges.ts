import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongoClient';
import {
  User,
  UserBadge,
  BADGE_DESCRIPTIONS,
  BADGE_LABELS,
} from '@/models/User';
import { Review } from '@/models/Review';
import { Place } from '@/models/Place';
import { BusinessVisit } from '@/models/BusinessVisit';
import { PlacePhoto } from '@/models/PlacePhoto';

/** Thresholds aligned with BADGE_DESCRIPTIONS copy. */
export const BADGE_THRESHOLDS: Record<UserBadge, number> = {
  explorer: 5,
  accessibility_hero: 25,
  city_mapper: 10,
  photo_contributor: 20,
  /** One or more moderator-verified reviews. */
  verified_reviewer: 1,
};

export type BadgeCounts = {
  placesVisited: number;
  reviewCount: number;
  placesAdded: number;
  photosUploaded: number;
  verifiedReviewCount: number;
};

export type BadgeProgress = {
  id: UserBadge;
  label: string;
  description: string;
  earned: boolean;
  threshold: number;
  current: number;
  progress: number;
};

export function computeEarnedBadges(counts: BadgeCounts): UserBadge[] {
  const earned: UserBadge[] = [];
  if (counts.placesVisited >= BADGE_THRESHOLDS.explorer) earned.push('explorer');
  if (counts.reviewCount >= BADGE_THRESHOLDS.accessibility_hero) {
    earned.push('accessibility_hero');
  }
  if (counts.placesAdded >= BADGE_THRESHOLDS.city_mapper) earned.push('city_mapper');
  if (counts.photosUploaded >= BADGE_THRESHOLDS.photo_contributor) {
    earned.push('photo_contributor');
  }
  if (counts.verifiedReviewCount >= BADGE_THRESHOLDS.verified_reviewer) {
    earned.push('verified_reviewer');
  }
  return earned;
}

export function buildBadgeProgress(counts: BadgeCounts, earned: UserBadge[]): BadgeProgress[] {
  const earnedSet = new Set(earned);
  const currentFor = (id: UserBadge): number => {
    switch (id) {
      case 'explorer':
        return counts.placesVisited;
      case 'accessibility_hero':
        return counts.reviewCount;
      case 'city_mapper':
        return counts.placesAdded;
      case 'photo_contributor':
        return counts.photosUploaded;
      case 'verified_reviewer':
        return counts.verifiedReviewCount;
    }
  };

  return (Object.keys(BADGE_THRESHOLDS) as UserBadge[]).map((id) => {
    const threshold = BADGE_THRESHOLDS[id];
    const current = currentFor(id);
    return {
      id,
      label: BADGE_LABELS[id],
      description: BADGE_DESCRIPTIONS[id],
      earned: earnedSet.has(id),
      threshold,
      current,
      progress: Math.min(1, current / threshold),
    };
  });
}

export async function collectBadgeCounts(userId: string): Promise<BadgeCounts> {
  const uid = new ObjectId(userId);
  const reviewsCol = await getCollection<Review>('reviews');
  const placesCol = await getCollection<Place>('places');
  const visitsCol = await getCollection<BusinessVisit>('businessVisits');
  const photosCol = await getCollection<PlacePhoto>('placePhotos');
  const activitiesCol = await getCollection<{
    userId: ObjectId;
    type: string;
    metadata?: { count?: number; kinds?: string[] };
  }>('activities');

  const [reviews, placesAdded, visits, attributedPhotos, uploadActivities] = await Promise.all([
    reviewsCol.find({ userId: uid }).project({ placeId: 1, photoUrls: 1, adminVerified: 1 }).toArray(),
    placesCol.countDocuments({ createdByUserId: uid }),
    visitsCol.find({ studentUserId: uid }).project({ placeId: 1 }).toArray(),
    photosCol.countDocuments({ 'uploadedBy.userId': uid }),
    activitiesCol
      .find({ userId: uid, type: 'photo_uploaded' })
      .project({ metadata: 1 })
      .toArray(),
  ]);

  const visited = new Set<string>();
  for (const r of reviews) visited.add(r.placeId.toString());
  for (const v of visits) visited.add(v.placeId.toString());

  const reviewPhotos = reviews.reduce((sum, r) => sum + (r.photoUrls?.length ?? 0), 0);
  const activityPhotos = uploadActivities.reduce((sum, a) => {
    const kinds = a.metadata?.kinds;
    if (kinds?.length) {
      return sum + kinds.filter((k: string) => k === 'image').length;
    }
    return sum + (typeof a.metadata?.count === 'number' ? a.metadata.count : 0);
  }, 0);

  // Prefer attributed records; fall back to activity sum when uploads aren't on reviews yet.
  const photosUploaded = Math.max(reviewPhotos + attributedPhotos, activityPhotos);

  return {
    placesVisited: visited.size,
    reviewCount: reviews.length,
    placesAdded,
    photosUploaded,
    verifiedReviewCount: reviews.filter((r) => r.adminVerified).length,
  };
}

/**
 * Idempotent badge evaluation: counts contributions and $addToSet newly earned badges.
 * Returns the badges awarded in this call (may be empty).
 */
export async function evaluateBadges(userId: string): Promise<UserBadge[]> {
  if (!ObjectId.isValid(userId)) return [];

  const counts = await collectBadgeCounts(userId);
  const shouldHave = computeEarnedBadges(counts);
  if (shouldHave.length === 0) return [];

  const users = await getCollection<User>('users');
  const user = await users.findOne({ _id: new ObjectId(userId) }, { projection: { badges: 1 } });
  const existing = new Set(user?.badges ?? []);
  const newlyEarned = shouldHave.filter((b) => !existing.has(b));
  if (newlyEarned.length === 0) return [];

  await users.updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { badges: { $each: newlyEarned } }, $set: { updatedAt: new Date() } }
  );

  return newlyEarned;
}

/** Fire-and-forget wrapper — never rejects the caller. */
export function scheduleBadgeEvaluation(userId: string | undefined | null): void {
  if (!userId) return;
  void evaluateBadges(userId).catch((err) => {
    console.error('Badge evaluation failed:', err);
  });
}
