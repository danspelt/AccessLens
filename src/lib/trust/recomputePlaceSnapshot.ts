import { getCollection } from '@/lib/db/mongoClient';
import { PlaceSnapshot, SnapshotFieldName } from '@/models/PlaceSnapshot';
import { Review, AccessibilityAnswer } from '@/models/Review';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';

const FIELDS: SnapshotFieldName[] = [
  'stepFreeEntrance',
  'ramp',
  'accessibleWashroom',
  'elevator',
  'accessibleParking',
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function recencyWeight(createdAt: Date, now: Date) {
  const days = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const halfLifeDays = 180;
  const weight = Math.pow(0.5, days / halfLifeDays);
  return clamp(weight, 0.1, 1.0);
}

function confidenceWeight(confidence: number | undefined) {
  if (confidence === undefined) return 1.0;
  return clamp(0.5 + (confidence - 1) * 0.25, 0.5, 1.5);
}

function repWeight(repScore: number | undefined) {
  const rep = repScore ?? 0;
  return clamp(1 + rep / 100, 0.8, 1.5);
}

function evidenceBonus(photoIds: string[] | undefined) {
  return photoIds && photoIds.length > 0 ? 0.2 : 0;
}

function valueFromReview(review: Review, field: SnapshotFieldName): AccessibilityAnswer | undefined {
  return review[field] as AccessibilityAnswer | undefined;
}

export async function recomputePlaceSnapshot(placeId: string | ObjectId) {
  const placeObjectId = typeof placeId === 'string' ? new ObjectId(placeId) : placeId;
  const now = new Date();

  const reviewsCollection = await getCollection<Review>('reviews');
  const usersCollection = await getCollection<User>('users');
  const snapshotsCollection = await getCollection<PlaceSnapshot>('place_snapshots');

  const reviews = await reviewsCollection
    .find({ placeId: placeObjectId })
    .sort({ createdAt: -1 })
    .limit(25)
    .toArray();

  const reportCount = await reviewsCollection.countDocuments({ placeId: placeObjectId });

  const userIds = [...new Set(reviews.map((r) => r.userId.toString()))];
  const users = userIds.length
    ? await usersCollection
        .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
        .project({ _id: 1, repScore: 1 })
        .toArray()
    : [];

  const repMap = new Map(users.map((u) => [u._id.toString(), u.repScore ?? 0]));

  const fields: PlaceSnapshot['fields'] = {};
  const conflicts: PlaceSnapshot['conflicts'] = {};

  let totalWeight = 0;
  let totalConfidenceWeighted = 0;
  let photoCount = 0;

  for (const review of reviews) {
    const w =
      recencyWeight(review.createdAt, now) *
      confidenceWeight(review.confidence) *
      repWeight(repMap.get(review.userId.toString())) +
      evidenceBonus(review.photoIds);

    totalWeight += w;
    totalConfidenceWeighted += w * (review.confidence ?? 3);

    if (review.photoIds && review.photoIds.length > 0) {
      photoCount += review.photoIds.length;
    }
  }

  const confidenceScore = totalWeight > 0 ? totalConfidenceWeighted / totalWeight : 0;

  for (const field of FIELDS) {
    const score: Record<AccessibilityAnswer, number> = {
      yes: 0,
      no: 0,
      partial: 0,
      unknown: 0,
    };

    for (const review of reviews) {
      const v = valueFromReview(review, field);
      if (!v) continue;

      const w =
        recencyWeight(review.createdAt, now) *
        confidenceWeight(review.confidence) *
        repWeight(repMap.get(review.userId.toString())) +
        evidenceBonus(review.photoIds);

      score[v] += w;
    }

    const entries = (Object.entries(score) as Array<[AccessibilityAnswer, number]>).sort(
      (a, b) => b[1] - a[1]
    );

    const [topValue, topScore] = entries[0];
    const [, secondScore] = entries[1];

    if (topScore <= 0) {
      fields[field] = undefined;
      conflicts[field] = false;
      continue;
    }

    fields[field] = topValue;

    const conflictThreshold = topScore * 0.8;
    conflicts[field] = secondScore > 0 && secondScore >= conflictThreshold;
  }

  await snapshotsCollection.updateOne(
    { placeId: placeObjectId },
    {
      $set: {
        placeId: placeObjectId,
        fields,
        conflicts,
        lastComputedAt: now,
        signals: {
          reportCount,
          photoCount,
          confidenceScore: Number.isFinite(confidenceScore) ? confidenceScore : 0,
        },
      },
    },
    { upsert: true }
  );
}
