export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongoClient';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { canSubmitCommunityFeedback } from '@/lib/auth/accountType';
import {
  Place,
  PLACE_CATEGORIES,
  CATEGORY_ICONS,
  getScoreColor,
  getScoreLabel,
  PARTNER_LABEL_DISPLAY,
} from '@/models/Place';
import { profileToPublicTags, VERIFICATION_LABELS } from '@/lib/accessibility/tags';
import { Review } from '@/models/Review';
import { User } from '@/models/User';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ChecklistItem } from '@/components/ui/ChecklistItem';
import { PhotoGallery } from '@/components/photos/PhotoGallery';
import { NoMapPlaceholder } from '@/components/map/PlaceMap';
import { PlaceMiniMap } from '@/components/map/PlaceMiniMap';
import { Badge } from '@/components/ui/Badge';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import {
  MapPin,
  Globe,
  Phone,
  ArrowLeft,
  Star,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Flag,
  MessageSquare,
} from 'lucide-react';
import { Favorite } from '@/models/Favorite';
import { getApprovedPhotoUrls } from '@/lib/db/placePhotos';
import { absoluteUrl, buildPageMetadata, serializeJsonLd } from '@/lib/seo';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return {};
  const collection = await getCollection<Place>('places');
  const place = await collection.findOne({ _id: new ObjectId(id) });
  if (!place) return {};
  if (place.status !== 'active') {
    return {
      title: place.name,
      robots: { index: false, follow: false },
    };
  }

  const categoryLabel =
    PLACE_CATEGORIES[place.category as keyof typeof PLACE_CATEGORIES] || place.category;
  return buildPageMetadata({
    title: `${place.name} Accessibility in ${place.city}, ${place.province}`,
    description: `Check accessibility details for ${place.name}, a ${categoryLabel.toLowerCase()} in ${place.city}, ${place.province}. Review entrance, washroom, parking, mobility, and sensory information before you visit.`,
    path: `/places/${place._id.toString()}`,
  });
}

async function getPlaceData(id: string) {
  if (!ObjectId.isValid(id)) return null;

  const placesCollection = await getCollection<Place>('places');
  const reviewsCollection = await getCollection<Review>('reviews');
  const usersCollection = await getCollection<User>('users');

  const place = await placesCollection.findOne({ _id: new ObjectId(id) });
  if (!place) return null;

  const reviews = await reviewsCollection
    .find({ placeId: new ObjectId(id) })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const userIds = [...new Set(reviews.map((r) => r.userId.toString()))];
  const users =
    userIds.length > 0
      ? await usersCollection
          .find({ _id: { $in: userIds.map((uid) => new ObjectId(uid)) } })
          .project({ _id: 1, name: 1 })
          .toArray()
      : [];

  const userMap = new Map(users.map((u) => [u._id.toString(), (u as { _id: ObjectId; name: string }).name]));

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  const displayPhotoUrls = await getApprovedPhotoUrls(place._id);

  return {
    place: {
      ...place,
      displayPhotoUrls,
      _id: place._id.toString(),
      createdByUserId: place.createdByUserId.toString(),
      createdAt: place.createdAt.toISOString(),
      updatedAt: place.updatedAt.toISOString(),
    },
    reviews: reviews.map((r) => ({
      ...r,
      _id: r._id.toString(),
      placeId: r.placeId.toString(),
      userId: r.userId.toString(),
      authorName: userMap.get(r.userId.toString()) || 'Anonymous',
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    avgRating,
    reviewCount: reviews.length,
  };
}

const CHECKLIST_ITEMS: { key: keyof Place['checklist']; label: string; description: string }[] = [
  { key: 'entranceRamp', label: 'Entrance ramp or level access', description: 'No steps to enter the building' },
  { key: 'automaticDoor', label: 'Automatic door opener', description: 'Push button or sensor-activated doors' },
  { key: 'levelEntrance', label: 'Level entrance', description: 'Flat, no lips or raised edges at entrance' },
  { key: 'elevator', label: 'Elevator to all floors', description: 'Accessible elevator available' },
  { key: 'wideAisles', label: 'Wide aisles (36"+)', description: 'Aisles wide enough for wheelchairs' },
  { key: 'accessibleSeating', label: 'Accessible seating', description: 'Dedicated accessible seating areas' },
  { key: 'accessibleWashroom', label: 'Accessible washroom', description: 'Accessible toilet stall with grab bars' },
  { key: 'genderNeutralWashroom', label: 'Gender-neutral washroom', description: 'Non-gendered accessible washroom' },
  { key: 'accessibleParking', label: 'Accessible parking', description: 'Designated accessible parking spaces nearby' },
  { key: 'transitAccessible', label: 'Transit accessible', description: 'Accessible transit stop within 1 block' },
  { key: 'brailleSignage', label: 'Braille signage', description: 'Tactile signage for visually impaired' },
  { key: 'audioAnnouncements', label: 'Audio announcements', description: 'Audio cues for floors, directions' },
  { key: 'serviceAnimalWelcome', label: 'Service animals welcome', description: 'Explicitly welcomes service animals' },
  { key: 'quietSpace', label: 'Quiet space available', description: 'Low-stimulation area available' },
];

export default async function PlaceDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getPlaceData(id);
  if (!data) notFound();

  const { place, reviews, avgRating, reviewCount } = data;
  const currentUser = await getCurrentUser();
  const canReviewAndReport = currentUser
    ? canSubmitCommunityFeedback(currentUser.accountType)
    : false;
  const favoritesCollection = await getCollection<Favorite>('favorites');
  const isFavorited =
    currentUser?._id && ObjectId.isValid(place._id)
      ? !!(await favoritesCollection.findOne({
          userId: currentUser._id,
          placeId: new ObjectId(place._id),
        }))
      : false;

  const score = place.accessibilityScore;
  const scoreColor = score !== undefined ? getScoreColor(score) : null;
  const scoreLabel = score !== undefined ? getScoreLabel(score) : null;

  const scoreColorMap = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };

  const categoryLabel = PLACE_CATEGORIES[place.category as keyof typeof PLACE_CATEGORIES] || place.category;
  const categoryIcon = CATEGORY_ICONS[place.category as keyof typeof CATEGORY_ICONS] || '📍';
  const publicTags = profileToPublicTags(place.accessibilityProfile);
  const verificationLabel = place.verificationLevel
    ? VERIFICATION_LABELS[place.verificationLevel]
    : null;
  const partnerLabel = place.partnerLabel
    ? PARTNER_LABEL_DISPLAY[place.partnerLabel]
    : null;
  const scoreCriteria: (keyof Place['checklist'])[] = [
    'entranceRamp',
    'automaticDoor',
    'levelEntrance',
    'elevator',
    'wideAisles',
    'accessibleWashroom',
    'accessibleParking',
    'transitAccessible',
    'brailleSignage',
    'serviceAnimalWelcome',
  ];
  const knownScoreCriteria = scoreCriteria.filter((key) => typeof place.checklist[key] === 'boolean').length;
  const quickSummaryItems = [
    { label: 'Entrance ramp', value: place.checklist.entranceRamp },
    { label: 'Automatic door', value: place.checklist.automaticDoor },
    { label: 'Elevator', value: place.checklist.elevator },
    { label: 'Accessible washroom', value: place.checklist.accessibleWashroom },
    { label: 'Accessible parking', value: place.checklist.accessibleParking },
    { label: 'Service animals', value: place.checklist.serviceAnimalWelcome },
  ];
  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: place.name,
    url: absoluteUrl(`/places/${place._id}`),
    description:
      place.description ||
      `Accessibility information for ${place.name} in ${place.city}, ${place.province}.`,
    image:
      place.displayPhotoUrls.length > 0
        ? place.displayPhotoUrls.map((photoUrl) => absoluteUrl(photoUrl))
        : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.address,
      addressLocality: place.city,
      addressRegion: place.province,
      postalCode: place.postalCode,
      addressCountry: place.country,
    },
    geo:
      place.latitude !== undefined && place.longitude !== undefined
        ? {
            '@type': 'GeoCoordinates',
            latitude: place.latitude,
            longitude: place.longitude,
          }
        : undefined,
    aggregateRating:
      avgRating !== null && reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: avgRating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    additionalProperty: [
      ...(score !== undefined
        ? [
            {
              '@type': 'PropertyValue',
              name: 'AccessLens accessibility score',
              value: `${score}/100`,
            },
          ]
        : []),
      ...quickSummaryItems
        .filter(({ value }) => typeof value === 'boolean')
        .map(({ label, value }) => ({
          '@type': 'PropertyValue',
          name: label,
          value: value ? 'Available' : 'Not reported as available',
        })),
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(placeJsonLd) }}
      />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-primary-600">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/explore" className="hover:text-primary-600">Explore</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-slate-900 font-medium truncate max-w-xs" aria-current="page">
                {place.name}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="rounded-xl panel-surface p-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl" role="img" aria-label={categoryLabel}>{categoryIcon}</span>
                <Badge variant="info">{categoryLabel}</Badge>
                <Badge variant="default">{place.city}, {place.province}</Badge>
                {verificationLabel ? (
                  <Badge variant="success">{verificationLabel}</Badge>
                ) : null}
                {partnerLabel ? <Badge variant="info">{partnerLabel}</Badge> : null}
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{place.name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                {place.address}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {currentUser && (
                  <FavoriteButton placeId={place._id} initialFavorited={isFavorited} />
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {/* Accessibility score */}
                {score !== undefined && scoreColor && (
                  <div
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 ${scoreColorMap[scoreColor]}`}
                    role="img"
                    aria-label={`Accessibility score: ${score} out of 100 — ${scoreLabel}`}
                  >
                    <span className="text-2xl font-bold">{score}</span>
                    <div>
                      <p className="text-xs font-semibold opacity-70">/ 100</p>
                      <p className="text-xs font-medium">{scoreLabel}</p>
                    </div>
                  </div>
                )}

                {/* Avg rating */}
                {avgRating !== null && (
                  <div
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2"
                    aria-label={`Average rating: ${avgRating} out of 5 stars from ${reviewCount} reviews`}
                  >
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <div>
                      <p className="text-lg font-bold text-amber-800">{avgRating}</p>
                      <p className="text-xs text-amber-700">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="mt-4 flex flex-wrap gap-3">
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    Website
                  </a>
                )}
                {place.phone && (
                  <a
                    href={`tel:${place.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {place.phone}
                  </a>
                )}
              </div>

              {place.description && (
                <p className="mt-4 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
                  {place.description}
                </p>
              )}

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">How to read this accessibility snapshot</p>
                <p className="mt-1 leading-relaxed">
                  The score summarizes 10 recorded accessibility criteria; it does not guarantee that a place will
                  meet every person&apos;s needs. {knownScoreCriteria} of 10 score criteria currently have a Yes or No
                  answer. Review the checklist, notes, photos, and recent community experiences before planning a visit.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Listing updated {new Date(place.updatedAt).toLocaleDateString('en-CA', { dateStyle: 'medium' })}.
                </p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Contribute accessibility information">
                <Link
                  href="#reviews"
                  className="flex min-h-11 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  {currentUser && canReviewAndReport ? 'Write a review or add photos' : 'Read or add reviews'}
                </Link>
                <Link
                  href={`/places/${place._id}/update-accessibility`}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-800 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Update details or photos
                </Link>
              </div>
            </div>

            <section aria-labelledby="mobile-summary-heading" className="rounded-xl panel-surface p-5 lg:hidden">
              <h2 id="mobile-summary-heading" className="mb-3 text-base font-semibold text-slate-900">
                At a glance
              </h2>
              <dl className="grid gap-2 sm:grid-cols-2">
                {quickSummaryItems.map(({ label, value }) => (
                  <div key={label} className="flex min-h-9 items-center justify-between gap-3 border-b border-slate-100 py-1.5">
                    <dt className="text-sm text-slate-700">{label}</dt>
                    <dd
                      className={`text-sm font-semibold ${
                        value === true ? 'text-green-700' : value === false ? 'text-red-700' : 'text-slate-500'
                      }`}
                    >
                      {value === true ? 'Yes' : value === false ? 'No' : 'Unknown'}
                    </dd>
                  </div>
                ))}
              </dl>
              <a href="#checklist-heading" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                View all accessibility details
              </a>
            </section>

            {/* Photos */}
            {(place as { displayPhotoUrls?: string[] }).displayPhotoUrls &&
              (place as { displayPhotoUrls: string[] }).displayPhotoUrls.length > 0 && (
              <section aria-labelledby="photos-heading" className="rounded-xl panel-surface p-6">
                <h2 id="photos-heading" className="mb-4 text-lg font-semibold text-slate-900">
                  Accessibility Photos ({(place as { displayPhotoUrls: string[] }).displayPhotoUrls.length})
                </h2>
                <PhotoGallery
                  urls={(place as { displayPhotoUrls: string[] }).displayPhotoUrls}
                  placeName={place.name}
                />
              </section>
            )}

            {publicTags.length > 0 && (
              <section aria-labelledby="tags-heading" className="rounded-xl panel-surface p-6">
                <h2 id="tags-heading" className="mb-4 text-lg font-semibold text-slate-900">
                  Accessibility highlights
                </h2>
                <ul className="flex flex-wrap gap-2" role="list">
                  {publicTags.map((t) => (
                    <li key={t.id}>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          t.status === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : t.status === 'partial'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Accessibility checklist */}
            <section aria-labelledby="checklist-heading" className="rounded-xl panel-surface p-6">
              <h2 id="checklist-heading" className="mb-4 text-lg font-semibold text-slate-900">
                Accessibility Checklist
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-slate-600">
                Yes and No are reported values. Unknown means the information has not been confirmed yet—not that
                the feature is unavailable.
              </p>
              {place.accessibilityNotes && (
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                  <strong>Notes:</strong> {place.accessibilityNotes}
                </div>
              )}
              <div className="divide-y divide-slate-100">
                {CHECKLIST_ITEMS.map(({ key, label, description }) => (
                  <ChecklistItem
                    key={key}
                    label={label}
                    value={place.checklist[key as keyof typeof place.checklist] as boolean | undefined}
                    description={description}
                  />
                ))}
              </div>
            </section>

            {/* Reviews section */}
            <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-28 rounded-xl panel-surface p-4 sm:p-6">
              <h2 id="reviews-heading" className="mb-6 text-lg font-semibold text-slate-900">
                Community Reviews ({reviewCount})
              </h2>

              {currentUser && canReviewAndReport ? (
                <div className="mb-8 rounded-xl bg-slate-50 border border-slate-200 p-5">
                  <ReviewForm placeId={place._id} />
                </div>
              ) : currentUser && !canReviewAndReport ? (
                <div className="mb-6 rounded-xl border border-slate-200 bg-slate-100 p-4 text-center">
                  <p className="text-sm text-slate-700">
                    Business accounts can list places but cannot submit community reviews. Switch to a
                    community reviewer account to share accessibility experiences, or{' '}
                    <Link href="/places/new" className="font-semibold text-primary-600 underline hover:text-primary-700">
                      add or update your listing
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 p-5 text-center">
                  <p className="text-sm font-semibold text-primary-900">Account required to comment</p>
                  <p className="mt-1 text-sm text-primary-800">
                    Create a free AccessLens account before you can review this business. Your sign-in
                    keeps reviews honest and lets you earn contributor badges.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href={`/signup?callbackUrl=${encodeURIComponent(`/places/${place._id}`)}`}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      Create a free account
                    </Link>
                    <Link
                      href={`/signin?callbackUrl=${encodeURIComponent(`/places/${place._id}`)}`}
                      className="text-sm font-semibold text-primary-800 underline hover:text-primary-950"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              )}

              <ReviewList reviews={reviews} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5" aria-label="Place information sidebar">
            {/* Map */}
            <div className="rounded-xl panel-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Location</h2>
              {place.latitude && place.longitude ? (
                <PlaceMiniMap lat={place.latitude} lng={place.longitude} name={place.name} address={place.address} />
              ) : (
                <NoMapPlaceholder name={place.name} address={place.address} />
              )}
              <p className="mt-2 text-xs text-slate-500">{place.address}</p>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl panel-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Quick Summary</h2>
              <dl className="space-y-2">
                {quickSummaryItems.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <dt className="text-xs text-slate-600">{label}</dt>
                    <dd
                      className={`text-xs font-semibold ${
                        value === true
                          ? 'text-green-600'
                          : value === false
                          ? 'text-red-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {value === true ? '✓ Yes' : value === false ? '✗ No' : '? Unknown'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Actions */}
            <div className="rounded-xl panel-surface p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Actions</h2>
              <Link
                href={`/places/${place._id}/update-accessibility`}
                className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
              >
                <Flag className="h-4 w-4" aria-hidden="true" />
                Suggest an Accessibility Update
              </Link>
              {!place.isClaimed && (
                <Link
                  href={`/places/${place._id}/claim`}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Star className="h-4 w-4" aria-hidden="true" />
                  Claim This Listing
                </Link>
              )}
            </div>

            {/* Report issue */}
            {currentUser && canReviewAndReport && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">See an issue?</p>
                    <p className="mt-1 text-xs text-yellow-700">
                      Report a broken elevator, blocked ramp, or other barrier.
                    </p>
                    <Link
                      href={`/places/${place._id}/report`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-yellow-800 underline hover:text-yellow-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-600 rounded"
                    >
                      <Flag className="h-3 w-3" aria-hidden="true" />
                      Report accessibility issue
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Back */}
            <Link
              href="/explore"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to explore
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
