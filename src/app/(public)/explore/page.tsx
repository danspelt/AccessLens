import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceFilters } from '@/components/places/PlaceFilters';
import { ExploreMap } from '@/components/map/ExploreMap';
import { MapPin } from 'lucide-react';
import { ObjectId } from 'mongodb';

export const metadata: Metadata = {
  title: 'Explore Accessible Places',
  description: 'Browse accessible places in Victoria, BC — libraries, restaurants, parks, theatres, and more.',
};

interface SearchParams {
  category?: string;
  search?: string;
  hasStepFree?: string;
  hasAccessibleWashroom?: string;
  hasAccessibleParking?: string;
  hasElevator?: string;
  view?: string;
}

async function getPlaces(searchParams: SearchParams) {
  const collection = await getCollection<Place>('places');
  const reviewsCollection = await getCollection<Review>('reviews');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};

  if (searchParams.category) query.category = searchParams.category;
  if (searchParams.search) query.name = { $regex: searchParams.search, $options: 'i' };
  if (searchParams.hasStepFree === 'true') query['checklist.entranceRamp'] = true;
  if (searchParams.hasAccessibleWashroom === 'true') query['checklist.accessibleWashroom'] = true;
  if (searchParams.hasAccessibleParking === 'true') query['checklist.accessibleParking'] = true;
  if (searchParams.hasElevator === 'true') query['checklist.elevator'] = true;

  const places = await collection
    .find(query)
    .sort({ accessibilityScore: -1, createdAt: -1 })
    .limit(100)
    .toArray();

  // Batch-fetch average ratings
  const placeIds = places.map((p) => p._id);
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

  return places.map((p) => {
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

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const places = await getPlaces(params);

  const mapPlaces = places
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({
      id: p._id,
      name: p.name,
      address: p.address,
      latitude: p.latitude!,
      longitude: p.longitude!,
      accessibilityScore: p.accessibilityScore,
      category: p.category,
    }));

  const hasActiveFilters = !!(
    params.category ||
    params.search ||
    params.hasStepFree ||
    params.hasAccessibleWashroom ||
    params.hasAccessibleParking ||
    params.hasElevator
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Explore Victoria, BC
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {places.length} place{places.length !== 1 ? 's' : ''} found
                {hasActiveFilters && ' with active filters'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-primary-500" aria-hidden="true" />
              Victoria, BC
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside
            className="shrink-0 lg:w-72"
            aria-label="Search filters"
          >
            <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Filter Places</h2>
              <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-slate-100" />}>
                <PlaceFilters />
              </Suspense>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Map */}
            {mapPlaces.length > 0 && (
              <section aria-label="Map of accessible places" className="mb-6">
                <div className="h-72 w-full overflow-hidden rounded-xl border border-slate-200 shadow-card">
                  <ExploreMap places={mapPlaces} />
                </div>
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Green = highly accessible · Yellow = partial · Red = barriers · Grey = unscored
                </p>
              </section>
            )}

            {/* Grid */}
            {places.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <MapPin className="h-12 w-12 text-slate-300" aria-hidden="true" />
                <div>
                  <p className="text-lg font-semibold text-slate-700">No places found</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {hasActiveFilters
                      ? 'Try removing some filters to see more results.'
                      : 'Be the first to add a place in Victoria!'}
                  </p>
                </div>
              </div>
            ) : (
              <section aria-label="List of accessible places">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {places.map((place) => (
                    <PlaceCard key={place._id} place={place} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
