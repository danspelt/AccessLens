import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceFilters } from '@/components/places/PlaceFilters';
import { AccessLensMapClient } from '@/components/map/AccessLensMapClient';
import { NearAddressSearch } from '@/components/explore/NearAddressSearch';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

function placeLatLng(p: {
  latitude?: number;
  longitude?: number;
  location?: { type: 'Point'; coordinates: [number, number] };
}): { lat: number; lng: number } | null {
  if (p.latitude != null && p.longitude != null && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)) {
    return { lat: p.latitude, lng: p.longitude };
  }
  const loc = p.location;
  if (loc?.type === 'Point' && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    const [lng, lat] = loc.coordinates;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
}

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
  near?: string;
  lat?: string;
  lon?: string;
  km?: string;
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
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

  let shaped = places.map((p) => {
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

  const lat = searchParams.lat ? Number(searchParams.lat) : NaN;
  const lon = searchParams.lon ? Number(searchParams.lon) : NaN;
  const km = searchParams.km ? Number(searchParams.km) : 5;
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    shaped = shaped
      .map((p) => {
        const ll = placeLatLng(p);
        if (!ll) return { ...p, distanceKm: null as number | null };
        return {
          ...p,
          distanceKm: haversineKm({ lat, lon }, { lat: ll.lat, lon: ll.lng }),
        };
      })
      .filter((p) => p.distanceKm === null || p.distanceKm <= (Number.isFinite(km) ? km : 5))
      .sort((a, b) => {
        const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
        return da - db;
      });
  }

  return shaped;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const places = await getPlaces(params);

  const mapPlaces = places.flatMap((p) => {
    const ll = placeLatLng(p);
    if (!ll) return [];
    return [
      {
        id: p._id,
        name: p.name,
        address: p.address,
        lat: ll.lat,
        lng: ll.lng,
        accessibilityScore: p.accessibilityScore,
        category: p.category,
      },
    ];
  });

  const placesWithoutCoords = places.length - mapPlaces.length;

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
              <div className="mb-4 border-b border-slate-100 pb-4">
                <NearAddressSearch />
              </div>
              <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-slate-100" />}>
                <PlaceFilters />
              </Suspense>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            <section aria-label="Map of Victoria and accessible places">
              <div className="relative min-h-[260px] h-[min(48vh,480px)] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                <AccessLensMapClient
                  places={mapPlaces}
                  className="h-full w-full"
                  ariaDescribedBy="explore-map-hint"
                />
                {placesWithoutCoords > 0 && (
                  <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 sm:right-auto sm:max-w-md">
                    <p className="pointer-events-auto rounded-lg border border-amber-200/80 bg-amber-50/95 px-3 py-2 text-xs text-amber-950 shadow-sm backdrop-blur-sm">
                      {placesWithoutCoords} place{placesWithoutCoords !== 1 ? 's' : ''} in this list{' '}
                      {placesWithoutCoords === 1 ? 'does' : 'do'} not have map coordinates yet — edit the place to add
                      latitude and longitude.
                    </p>
                  </div>
                )}
                {places.length === 0 && mapPlaces.length === 0 && (
                  <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 sm:right-auto sm:max-w-sm">
                    <p className="pointer-events-auto rounded-lg border border-slate-200/90 bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur-sm">
                      No listings yet.{' '}
                      <Link href="/add-place" className="font-semibold text-primary-600 hover:text-primary-700">
                        Add a place
                      </Link>{' '}
                      to see it on the map.
                    </p>
                  </div>
                )}
              </div>
              <p
                id="explore-map-hint"
                className="mt-2 text-center text-xs text-slate-500"
              >
                Click a blue pin for accessibility details. Click empty map to drop a pin and review accessibility
                for a new place.
              </p>
            </section>

            {places.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center">
                <MapPin className="h-10 w-10 text-slate-300" aria-hidden="true" />
                <div>
                  <p className="text-base font-semibold text-slate-700">No places match your filters</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {hasActiveFilters
                      ? 'Try removing some filters to see more results.'
                      : (
                          <>
                            Be the first to add a place in Victoria —{' '}
                            <Link href="/add-place" className="font-semibold text-primary-600 hover:text-primary-700">
                              add a place
                            </Link>
                            .
                          </>
                        )}
                  </p>
                </div>
              </div>
            ) : (
              <section aria-label="List of accessible places">
                <h2 className="mb-3 text-sm font-semibold text-slate-900">Places</h2>
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
