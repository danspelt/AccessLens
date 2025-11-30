import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceFilters } from '@/components/places/PlaceFilters';

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string;
    hasStepFree?: string;
    hasAccessibleWashroom?: string;
    hasAccessibleParking?: string;
  }>;
}

async function getPlacesWithRatings(filters: {
  category?: string;
  hasStepFree?: string;
  hasAccessibleWashroom?: string;
  hasAccessibleParking?: string;
}) {
  const placesCollection = await getCollection<Place>('places');
  const reviewsCollection = await getCollection<Review>('reviews');

  // Build query from filters
  const query: any = {};
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
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

  // Calculate average ratings for each place
  const placesWithRatings = await Promise.all(
    places.map(async (place) => {
      const reviews = await reviewsCollection
        .find({ placeId: place._id })
        .toArray();

      const ratings = reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : undefined;

      return {
        place,
        avgRating,
        reviewCount: reviews.length,
      };
    })
  );

  return placesWithRatings;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const filters = await searchParams;
  const placesWithRatings = await getPlacesWithRatings(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Places</h1>
        <p className="mt-2 text-gray-600">
          Discover accessible venues in your area
        </p>
      </div>

      <PlaceFilters />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placesWithRatings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No places found. Be the first to add one!</p>
          </div>
        ) : (
          placesWithRatings.map(({ place, avgRating, reviewCount }) => (
            <PlaceCard
              key={place._id.toString()}
              place={place}
              avgRating={avgRating}
              reviewCount={reviewCount}
            />
          ))
        )}
      </div>
    </div>
  );
}

