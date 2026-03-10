/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ACCESSIBILITY_CHECKLIST_LABELS,
  ACCESSIBILITY_STATUS_META,
  formatAccessibilityPercentage,
  getCityDefinition,
  PLACE_CATEGORIES,
  PLACE_CATEGORY_META,
} from '@/lib/accesslens/constants';
import { getPlaceBySlugs, getReviewsForPlace } from '@/lib/accesslens/data';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { PlaceCategory } from '@/models/Place';

interface PlaceDetailPageProps {
  params: Promise<{ citySlug: string; category: string; placeSlug: string }>;
}

export default async function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const { citySlug, category, placeSlug } = await params;
  const city = getCityDefinition(citySlug);

  if (!city || !PLACE_CATEGORIES.includes(category as PlaceCategory)) {
    notFound();
  }

  const place = await getPlaceBySlugs(citySlug, category, placeSlug);
  if (!place) {
    notFound();
  }

  const [reviews, user] = await Promise.all([getReviewsForPlace(place._id), getCurrentUser()]);
  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
      : null;
  const statusMeta = ACCESSIBILITY_STATUS_META[place.accessibilityStatus];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={`/${citySlug}/${category}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to {PLACE_CATEGORY_META[place.category].label}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusMeta.badgeClassName}`}
          >
            {statusMeta.label}
          </span>
          <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
            {PLACE_CATEGORY_META[place.category].label}
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-bold text-gray-900">{place.name}</h1>
        <p className="mt-3 text-lg text-gray-600">
          {place.address} • {place.city}, {place.province}
        </p>
        {place.description ? <p className="mt-4 max-w-3xl text-gray-700">{place.description}</p> : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Accessibility snapshot</h2>
                <p className="mt-2 text-gray-600">{statusMeta.description}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-5 py-4 text-right">
                <p className="text-sm text-gray-500">Access score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatAccessibilityPercentage(place.accessibilityScore)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(ACCESSIBILITY_CHECKLIST_LABELS).map(([key, label]) => {
                const isEnabled = place.accessibilityChecklist[key as keyof typeof place.accessibilityChecklist];

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                  >
                    <span className="text-sm text-gray-700">{label}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isEnabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                );
              })}
            </div>

            {place.accessibilityNotes ? (
              <div className="mt-6 rounded-xl bg-gray-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Community notes
                </p>
                <p className="mt-3 text-gray-700 whitespace-pre-wrap">{place.accessibilityNotes}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Evidence photos</h2>
                <p className="mt-2 text-gray-600">
                  Uploads from the community that document entrances, routes, washrooms, and barriers.
                </p>
              </div>
              <Link
                href="/upload"
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Upload evidence
              </Link>
            </div>

            {place.photoUrls && place.photoUrls.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {place.photoUrls.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`${place.name} accessibility photo ${index + 1}`}
                    className="h-56 w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                No evidence photos yet. Add the first upload for this place.
              </div>
            )}
          </section>

          {user ? (
            <section>
              <ReviewForm placeId={place._id.toString()} />
            </section>
          ) : (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Share your experience</h2>
              <p className="mt-3 text-gray-600">
                Log in to add a review, upload evidence, and document how accessible this place is in
                real life.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/login"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Create account
                </Link>
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Community reviews</h2>
            <ReviewList reviews={reviews} />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Quick facts</h2>
            <dl className="mt-4 space-y-4 text-sm text-gray-600">
              <div className="flex items-center justify-between gap-4">
                <dt>Accessibility score</dt>
                <dd className="font-semibold text-gray-900">
                  {formatAccessibilityPercentage(place.accessibilityScore)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Community rating</dt>
                <dd className="font-semibold text-gray-900">
                  {avgRating ? `${avgRating} / 5` : 'No ratings yet'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Reviews</dt>
                <dd className="font-semibold text-gray-900">{reviews.length}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Map & arrival</h2>
            <p className="mt-3 text-sm text-gray-600">
              Mapbox or Google Maps can be connected later. For now, use the location details below to
              preview the route.
            </p>
            <dl className="mt-4 space-y-3 text-sm text-gray-600">
              <div>
                <dt className="font-medium text-gray-900">Address</dt>
                <dd>{place.address}</dd>
              </div>
              {place.latitude && place.longitude ? (
                <div>
                  <dt className="font-medium text-gray-900">Coordinates</dt>
                  <dd>
                    {place.latitude}, {place.longitude}
                  </dd>
                </div>
              ) : null}
            </dl>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${place.name} ${place.address} ${place.city} ${place.province}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Open in Google Maps
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
