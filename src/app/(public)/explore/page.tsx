export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';
import { PlaceCard } from '@/components/places/PlaceCard';
import { buildPageMetadata } from '@/lib/seo';
import { PlaceFilters } from '@/components/places/PlaceFilters';
import { AccessLensMapClient } from '@/components/map/AccessLensMapClient';
import { NearAddressSearch } from '@/components/explore/NearAddressSearch';
import { Camera, ChevronDown, CircleParking, MapPin, MessageSquare, Plus } from 'lucide-react';
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

export const metadata: Metadata = buildPageMetadata({
  title: 'Find Accessible Places in Victoria & Vancouver, BC',
  description:
    'Search accessible restaurants, parks, libraries, shops, transit stops, and more in Victoria and Vancouver, BC. Compare accessibility checklists, photos, scores, and reviews.',
  path: '/explore',
});

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

  const query: Record<string, unknown> = {};

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
    <div className="min-h-screen">
      {/* Page header */}
      <div className="sticky top-16 z-20 border-b border-white/70 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/80 shadow-nav-bar backdrop-blur-md supports-[backdrop-filter]:from-white/80">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Explore</p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Find accessible places in Victoria &amp; Vancouver, BC
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Compare accessibility checklists, photos, scores, and reviews for {places.length} place{places.length !== 1 ? 's' : ''}
                {hasActiveFilters && ' with active filters'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-primary-200/80 bg-gradient-to-b from-primary-50 to-primary-100/80 px-3 py-1.5 text-sm font-medium text-primary-900 shadow-chip-icon md:inline-flex">
                <span className="orb-3d flex h-7 w-7 items-center justify-center rounded-full text-primary-700">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                Live map
              </div>
              <Link
                href="/places/new"
                className="link-cta-primary min-h-11 gap-2 px-3 py-2 text-sm font-semibold sm:px-4"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Add a place</span>
                <span className="sm:hidden">Add</span>
              </Link>
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
            <details className="group sticky top-28 rounded-2xl panel-surface" open={hasActiveFilters}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-5 font-display text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 lg:cursor-default">
                <span>
                  Filter places
                  {hasActiveFilters ? (
                    <span className="ml-2 font-sans text-xs font-medium text-primary-700">Active</span>
                  ) : null}
                </span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 lg:hidden" aria-hidden="true" />
              </summary>
              <div className="border-t border-slate-100 px-5 pb-5 pt-4 lg:!block">
                <div className="mb-4 border-b border-slate-100 pb-4">
                  <NearAddressSearch />
                </div>
                <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-slate-100" />}>
                  <PlaceFilters />
                </Suspense>
              </div>
            </details>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            <section aria-label="Map of Victoria and accessible places">
              <div className="relative min-h-[260px] h-[min(48vh,480px)] w-full overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-b from-slate-100 to-slate-200/90 shadow-card ring-1 ring-slate-900/[0.08]">
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
                      <Link href="/places/new" className="font-semibold text-primary-600 hover:text-primary-700">
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
                Select a map pin for a place summary and link to full accessibility details. Select an empty area to
                start adding a place.
              </p>
            </section>

            <section
              aria-labelledby="community-evidence-heading"
              className="rounded-2xl border border-primary-200 bg-primary-50/70 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id="community-evidence-heading" className="font-display text-base font-semibold text-primary-950">
                    Help build Victoria&apos;s accessibility record
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed text-primary-900">
                    Add a missing place, then strengthen place records over time with entrance or barrier photos,
                    confirmed checklist details, and written notes from a recent visit.
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-primary-800" aria-label="Useful community contributions">
                    <li className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />Place details</li>
                    <li className="flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" aria-hidden="true" />Photos of access features</li>
                    <li className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />Accessibility notes</li>
                  </ul>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-stretch">
                  <Link
                    href="/places/new"
                    className="link-cta-primary min-h-11 gap-2 px-4 py-2.5 text-sm font-semibold"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add a place
                  </Link>
                  <Link
                    href="/official-data/accessible-parking"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-300 bg-white px-4 py-2.5 text-sm font-semibold text-primary-800 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <CircleParking className="h-4 w-4" aria-hidden="true" />
                    Review parking candidates
                  </Link>
                </div>
              </div>
            </section>

            {places.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300/90 bg-white/90 py-10 text-center shadow-sm ring-1 ring-slate-900/[0.03] backdrop-blur-sm">
                <MapPin className="h-10 w-10 text-slate-300" aria-hidden="true" />
                <div>
                  <p className="text-base font-semibold text-slate-700">No places match your filters</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {hasActiveFilters
                      ? 'Try removing some filters to see more results.'
                      : (
                          <>
                            Be the first to add a place in Victoria —{' '}
                            <Link href="/places/new" className="font-semibold text-primary-600 hover:text-primary-700">
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
                <h2 className="mb-3 font-display text-sm font-semibold text-slate-900">Places</h2>
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
