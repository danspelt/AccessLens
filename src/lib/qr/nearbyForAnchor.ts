import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';
import type { QrAnchor } from './anchors';

export type QrNearbyPlace = Omit<Place, '_id' | 'createdByUserId' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  avgRating: number | null;
  reviewCount: number;
};

/**
 * Places near a QR anchor, same source of truth as /api/places/nearby + explore.
 */
export async function getPlacesNearbyQrAnchor(
  anchor: QrAnchor,
  limit = 16
): Promise<QrNearbyPlace[]> {
  const placesCollection = await getCollection<Place>('places');
  const reviewsCollection = await getCollection<Review>('reviews');
  const maxDistanceMeters = anchor.radiusKm * 1000;

  const docs = await placesCollection
    .find({
      citySlug: anchor.citySlug,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [anchor.longitude, anchor.latitude] },
          $maxDistance: maxDistanceMeters,
        },
      },
    })
    .limit(limit)
    .toArray();

  const placeIds = docs.map((p) => p._id);
  const reviews = await reviewsCollection
    .find({ placeId: { $in: placeIds } })
    .project({ placeId: 1, rating: 1 })
    .toArray();

  const ratingMap = new Map<string, { sum: number; count: number }>();
  reviews.forEach((r) => {
    const key = r.placeId.toString();
    const cur = ratingMap.get(key) || { sum: 0, count: 0 };
    ratingMap.set(key, { sum: cur.sum + r.rating, count: cur.count + 1 });
  });

  return docs.map((p) => {
    const ratingData = ratingMap.get(p._id.toString());
    const avgRating = ratingData
      ? Math.round((ratingData.sum / ratingData.count) * 10) / 10
      : null;
    return {
      ...p,
      _id: p._id.toString(),
      createdByUserId: p.createdByUserId.toString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      avgRating,
      reviewCount: ratingData?.count || 0,
    };
  });
}

export function summarizeHighlights(places: QrNearbyPlace[]) {
  const stepFree = places.filter(
    (p) => p.checklist?.entranceRamp || p.checklist?.levelEntrance
  ).length;
  const washroom = places.filter((p) => p.checklist?.accessibleWashroom).length;
  const parking = places.filter((p) => p.checklist?.accessibleParking).length;
  const strong = places.filter((p) => (p.accessibilityScore ?? 0) >= 70).length;
  return { stepFree, washroom, parking, strong, total: places.length };
}
