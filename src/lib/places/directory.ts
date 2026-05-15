import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getPlacesWithRatings(filters: {
  category?: string;
  city?: string;
  hasStepFree?: string;
  hasAccessibleWashroom?: string;
  hasAccessibleParking?: string;
}) {
  const placesCollection = await getCollection<Place>('places');
  const reviewsCollection = await getCollection<Review>('reviews');

  const query: Record<string, unknown> = {};
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }
  if (filters.city?.trim()) {
    query.city = new RegExp(`^${escapeRegex(filters.city.trim())}$`, 'i');
  }
  if (filters.hasStepFree === 'true') {
    query.stepFreeAccess = true;
  }
  if (filters.hasAccessibleWashroom === 'true') {
    query.accessibleWashroom = true;
  }
  if (filters.hasAccessibleParking === 'true') {
    query.accessibleParking = true;
  }

  const places = await placesCollection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const placesWithRatings = await Promise.all(
    places.map(async (place) => {
      const reviews = await reviewsCollection.find({ placeId: place._id }).toArray();

      const ratings = reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : undefined;

      return {
        place,
        avgRating,
        reviewCount: reviews.length,
      };
    })
  );

  return placesWithRatings;
}
