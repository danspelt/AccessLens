import { getCityDefinition, PLACE_CATEGORY_META } from '@/lib/accesslens/constants';
import { getReviewsForPlace, listPlaces } from '@/lib/accesslens/data';
import { Place } from '@/models/Place';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceFilters } from '@/components/places/PlaceFilters';

interface ExplorePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    ramp?: string;
    automaticDoor?: string;
    accessibleWashroom?: string;
    accessibleParking?: string;
  }>;
}

async function getPlacesWithRatings(filters: {
  search?: string;
  category?: string;
  ramp?: string;
  automaticDoor?: string;
  accessibleWashroom?: string;
  accessibleParking?: string;
}) {
  const places = await listPlaces({
    search: filters.search,
    category:
      filters.category && filters.category !== 'all'
        ? (filters.category as Place['category'])
        : undefined,
    ramp: filters.ramp === 'true',
    automaticDoor: filters.automaticDoor === 'true',
    accessibleWashroom: filters.accessibleWashroom === 'true',
    accessibleParking: filters.accessibleParking === 'true',
  });

  const placesWithRatings = await Promise.all(
    places.map(async (place) => {
      const reviews = await getReviewsForPlace(place._id);

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
  const victoria = getCityDefinition('victoria-bc');
  const activeCategory =
    filters.category && filters.category !== 'all'
      ? PLACE_CATEGORY_META[filters.category as Place['category']]?.label
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          AccessLens directory
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Explore accessible places</h1>
        <p className="mt-2 text-gray-600">
          Search the current AccessLens launch collection for {victoria?.name}. Use the checklist
          filters to find places that match your access needs.
        </p>
        {activeCategory ? (
          <p className="mt-2 text-sm text-gray-500">Showing category: {activeCategory}</p>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          <PlaceFilters />
        </div>

        <div>
          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-sm text-gray-500">Places found</p>
            <p className="text-2xl font-bold text-gray-900">{placesWithRatings.length}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {placesWithRatings.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
                <p className="text-gray-500">No places matched these filters yet.</p>
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
      </div>
    </div>
  );
}

