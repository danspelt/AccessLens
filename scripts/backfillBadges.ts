/**
 * Backfill badges for all users based on existing contributions.
 * Run: node --env-file=.env.local --import tsx scripts/backfillBadges.ts
 */
import { MongoClient, ObjectId } from 'mongodb';
import {
  BADGE_THRESHOLDS,
  computeEarnedBadges,
  type BadgeCounts,
} from '../src/lib/badges/awardBadges';
import type { UserBadge } from '../src/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'accesslens';

async function countsForUser(
  db: ReturnType<MongoClient['db']>,
  userId: ObjectId
): Promise<BadgeCounts> {
  const reviews = await db
    .collection('reviews')
    .find({ userId })
    .project({ placeId: 1, photoUrls: 1, adminVerified: 1 })
    .toArray();
  const placesAdded = await db.collection('places').countDocuments({ createdByUserId: userId });
  const visits = await db
    .collection('businessVisits')
    .find({ studentUserId: userId })
    .project({ placeId: 1 })
    .toArray();
  const attributedPhotos = await db
    .collection('placePhotos')
    .countDocuments({ 'uploadedBy.userId': userId });
  const uploadActivities = await db
    .collection('activities')
    .find({ userId, type: 'photo_uploaded' })
    .project({ metadata: 1 })
    .toArray();

  const visited = new Set<string>();
  for (const r of reviews) visited.add(String(r.placeId));
  for (const v of visits) visited.add(String(v.placeId));

  const reviewPhotos = reviews.reduce(
    (sum, r) => sum + ((r.photoUrls as string[] | undefined)?.length ?? 0),
    0
  );
  const activityPhotos = uploadActivities.reduce((sum, a) => {
    const meta = a.metadata as { count?: number; kinds?: string[] } | undefined;
    if (meta?.kinds?.length) {
      return sum + meta.kinds.filter((k: string) => k === 'image').length;
    }
    return sum + (typeof meta?.count === 'number' ? meta.count : 0);
  }, 0);

  return {
    placesVisited: visited.size,
    reviewCount: reviews.length,
    placesAdded,
    photosUploaded: Math.max(reviewPhotos + attributedPhotos, activityPhotos),
    verifiedReviewCount: reviews.filter((r) => r.adminVerified).length,
  };
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const users = db.collection('users');

  const cursor = users.find({}, { projection: { _id: 1, email: 1, badges: 1 } });
  let scanned = 0;
  let updated = 0;

  console.log('Badge thresholds:', BADGE_THRESHOLDS);

  for await (const user of cursor) {
    scanned++;
    const counts = await countsForUser(db, user._id as ObjectId);
    const shouldHave = computeEarnedBadges(counts);
    const existing = new Set<UserBadge>((user.badges as UserBadge[]) ?? []);
    const newly = shouldHave.filter((b) => !existing.has(b));
    if (newly.length === 0) continue;

    await users.updateOne(
      { _id: user._id },
      { $addToSet: { badges: { $each: newly } }, $set: { updatedAt: new Date() } }
    );
    updated++;
    console.log(`✓ ${user.email}: +${newly.join(', ')}`);
  }

  console.log(`\nDone. Scanned ${scanned} users, updated ${updated}.`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
