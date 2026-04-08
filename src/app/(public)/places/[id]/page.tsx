import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongoClient';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import {
  Place,
  PLACE_CATEGORIES,
  CATEGORY_ICONS,
  getScoreColor,
  getScoreLabel,
} from '@/models/Place';
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
  Flag,
} from 'lucide-react';
import { Favorite } from '@/models/Favorite';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!ObjectId.isValid(id)) return {};
  const collection = await getCollection<Place>('places');
  const place = await collection.findOne({ _id: new ObjectId(id) });
  if (!place) return {};
  return {
    title: `${place.name} — Accessibility Info`,
    description: `Accessibility information for ${place.name} in ${place.city}, ${place.province}. Score: ${place.accessibilityScore ?? 'unknown'}/100.`,
  };
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

  return {
    place: {
      ...place,
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

  return (
    <div className="min-h-screen bg-slate-50">
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
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl" role="img" aria-label={categoryLabel}>{categoryIcon}</span>
                <Badge variant="info">{categoryLabel}</Badge>
                <Badge variant="default">{place.city}, {place.province}</Badge>
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
            </div>

            {/* Photos */}
            {place.photoUrls && place.photoUrls.length > 0 && (
              <section aria-labelledby="photos-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <h2 id="photos-heading" className="mb-4 text-lg font-semibold text-slate-900">
                  Accessibility Photos ({place.photoUrls.length})
                </h2>
                <PhotoGallery urls={place.photoUrls} placeName={place.name} />
              </section>
            )}

            {/* Accessibility checklist */}
            <section aria-labelledby="checklist-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 id="checklist-heading" className="mb-4 text-lg font-semibold text-slate-900">
                Accessibility Checklist
              </h2>
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
            <section aria-labelledby="reviews-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 id="reviews-heading" className="mb-6 text-lg font-semibold text-slate-900">
                Community Reviews ({reviewCount})
              </h2>

              {currentUser ? (
                <div className="mb-8 rounded-xl bg-slate-50 border border-slate-200 p-5">
                  <ReviewForm placeId={place._id} />
                </div>
              ) : (
                <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 p-4 text-center">
                  <p className="text-sm text-primary-700">
                    <Link href={`/login?redirectTo=/places/${place._id}`} className="font-semibold underline hover:text-primary-800">
                      Sign in
                    </Link>{' '}
                    or{' '}
                    <Link href="/signup" className="font-semibold underline hover:text-primary-800">
                      create an account
                    </Link>{' '}
                    to share your accessibility experience.
                  </p>
                </div>
              )}

              <ReviewList reviews={reviews} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5" aria-label="Place information sidebar">
            {/* Map */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Location</h2>
              {place.latitude && place.longitude ? (
                <PlaceMiniMap lat={place.latitude} lng={place.longitude} name={place.name} address={place.address} />
              ) : (
                <NoMapPlaceholder name={place.name} address={place.address} />
              )}
              <p className="mt-2 text-xs text-slate-500">{place.address}</p>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Quick Summary</h2>
              <dl className="space-y-2">
                {[
                  { label: 'Entrance ramp', value: place.checklist.entranceRamp },
                  { label: 'Automatic door', value: place.checklist.automaticDoor },
                  { label: 'Elevator', value: place.checklist.elevator },
                  { label: 'Accessible washroom', value: place.checklist.accessibleWashroom },
                  { label: 'Accessible parking', value: place.checklist.accessibleParking },
                  { label: 'Service animals', value: place.checklist.serviceAnimalWelcome },
                ].map(({ label, value }) => (
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

            {/* Report issue */}
            {currentUser && (
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
