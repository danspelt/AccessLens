import { getPlacesWithRatings } from '@/lib/places/directory';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceFilters } from '@/components/places/PlaceFilters';
import Link from 'next/link';

interface PlacesPageProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
    hasStepFree?: string;
    hasAccessibleWashroom?: string;
    hasAccessibleParking?: string;
  }>;
}

export default async function PlacesPage({ searchParams }: PlacesPageProps) {
  const filters = await searchParams;
  const placesWithRatings = await getPlacesWithRatings(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Places</h1>
          <p className="mt-2 text-gray-600">
            Browse accessibility information for venues and public spaces.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Information comes from the community and may change. Contact venues directly for critical
            access needs.
          </p>
        </div>
        <Link
          href="/city/victoria-bc"
          className="inline-flex w-fit items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
        >
          Victoria, BC hub
        </Link>
      </div>

      <PlaceFilters />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placesWithRatings.length === 0 ? (
          <div className="col-span-full py-12 text-center">
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
