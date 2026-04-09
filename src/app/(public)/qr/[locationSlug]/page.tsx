import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ArrowRight, Compass } from 'lucide-react';
import { getQrAnchor } from '@/lib/qr/anchors';
import { getPlacesNearbyQrAnchor, summarizeHighlights } from '@/lib/qr/nearbyForAnchor';
import { PlaceCard } from '@/components/places/PlaceCard';

interface Props {
  params: Promise<{ locationSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationSlug } = await params;
  const anchor = getQrAnchor(locationSlug);
  if (!anchor) return { title: 'Location' };
  return {
    title: `${anchor.title} — Nearby accessible places`,
    description: `Accessibility-friendly places near ${anchor.title}. Open the full AccessLens map to plan or explore.`,
  };
}

export default async function QrLocationPage({ params }: Props) {
  const { locationSlug } = await params;
  const anchor = getQrAnchor(locationSlug);
  if (!anchor) notFound();

  const raw = await getPlacesNearbyQrAnchor(anchor, 20);
  const places = [...raw].sort(
    (a, b) => (b.accessibilityScore ?? 0) - (a.accessibilityScore ?? 0)
  );
  const highlights = summarizeHighlights(places);

  const exploreHref = `/explore?lat=${anchor.latitude}&lon=${anchor.longitude}&km=${anchor.radiusKm}`;
  const cityHref = `/cities/${anchor.citySlug}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <p className="flex items-center gap-2 text-sm font-medium text-primary-200">
            <Compass className="h-4 w-4 shrink-0" aria-hidden="true" />
            You&apos;re here
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{anchor.title}</h1>
          {anchor.subtitle ? (
            <p className="mt-2 text-base text-primary-100 leading-relaxed">{anchor.subtitle}</p>
          ) : null}
          <p className="mt-4 text-sm text-primary-200 leading-relaxed">
            Same AccessLens data as the full site — quick picks near this spot. No account needed to
            browse.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={exploreHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-900 shadow-md transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
            >
              Open full map
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={cityHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
            >
              Browse city hub
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium text-primary-200 underline-offset-4 hover:text-white hover:underline"
            >
              AccessLens home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {places.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900">Nearby accessibility highlights</h2>
            <p className="mt-1 text-sm text-slate-600">
              From places listed within ~{anchor.radiusKm} km of this QR anchor.
            </p>
            <ul
              className="mt-4 flex flex-wrap gap-2"
              aria-label="Quick counts for nearby listings"
            >
              <li className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                {highlights.strong} highly rated (70+)
              </li>
              <li className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                {highlights.stepFree} step-free / level entrance
              </li>
              <li className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                {highlights.washroom} accessible washroom
              </li>
              <li className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                {highlights.parking} accessible parking
              </li>
            </ul>

            <ul className="mt-8 space-y-4" role="list">
              {places.map((place) => (
                <li key={place._id}>
                  <PlaceCard place={place} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <MapPin
              className="mx-auto h-10 w-10 text-slate-400"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No geocoded places here yet</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              This QR anchor is live, but we don&apos;t have map coordinates for nearby listings in the
              database. Try the full explore view or the city page — or add a place when you&apos;re
              signed in.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={exploreHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Open explore
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={cityHref}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                City overview
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
