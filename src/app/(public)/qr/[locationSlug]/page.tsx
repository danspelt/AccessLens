export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicHero } from '@/components/layout/PublicHero';
import { MapPin, ArrowRight } from 'lucide-react';
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
    <div>
      <PublicHero
        size="compact"
        eyebrow="You are here"
        title={anchor.title}
        description={
          <>
            {anchor.subtitle ? <p className="mb-2">{anchor.subtitle}</p> : null}
            <p>
              Same AccessLens data as the full site — quick picks near this spot. No account needed to
              browse.
            </p>
          </>
        }
      >
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:flex-wrap">
          <Link
            href={exploreHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-900 shadow-lg transition-colors hover:bg-primary-50"
          >
            Open full map
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href={cityHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {anchor.citySlug} city guide
          </Link>
        </div>
      </PublicHero>

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
          <div className="rounded-2xl panel-surface p-8 text-center">
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
                className="link-cta-primary gap-2 px-5 py-2.5 text-sm"
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
