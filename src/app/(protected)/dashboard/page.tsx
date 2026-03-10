import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getCollection } from '@/lib/db/mongoClient';
import { Place, PLACE_CATEGORIES, CATEGORY_ICONS, getScoreColor } from '@/models/Place';
import { Review } from '@/models/Review';
import { ObjectId } from 'mongodb';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Star, Plus, LayoutDashboard, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const placesCollection = await getCollection<Place>('places');
  const reviewsCollection = await getCollection<Review>('reviews');

  const myPlaces = await placesCollection
    .find({ createdByUserId: user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  const myReviews = await reviewsCollection
    .find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  // Enrich reviews with place names
  const reviewPlaceIds = myReviews.map((r) => r.placeId);
  const reviewPlaces = await placesCollection
    .find({ _id: { $in: reviewPlaceIds } })
    .project({ _id: 1, name: 1, category: 1 })
    .toArray();
  const reviewPlaceMap = new Map(
    reviewPlaces.map((p) => [p._id.toString(), { name: (p as unknown as Place).name, category: (p as unknown as Place).category }])
  );

  const scoreColorMap = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                <LayoutDashboard className="h-5 w-5 text-primary-600" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome back, {user.name.split(' ')[0]}
                </h1>
                <p className="text-sm text-slate-500">
                  {myPlaces.length} place{myPlaces.length !== 1 ? 's' : ''} added ·{' '}
                  {myReviews.length} review{myReviews.length !== 1 ? 's' : ''} submitted
                </p>
              </div>
            </div>
            <Link href="/add-place">
              <Button size="md">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Place
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* My Places */}
          <section aria-labelledby="my-places-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="my-places-heading" className="text-lg font-semibold text-slate-900">
                Your Contributed Places
              </h2>
              <Link href="/explore" className="text-sm text-primary-600 hover:text-primary-700">
                View all →
              </Link>
            </div>

            {myPlaces.length === 0 ? (
              <Card className="flex flex-col items-center gap-4 py-10 text-center">
                <MapPin className="h-10 w-10 text-slate-300" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-700">No places yet</p>
                  <p className="mt-1 text-sm text-slate-500">Add the first accessible place you know of!</p>
                </div>
                <Link href="/add-place">
                  <Button variant="primary">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add Your First Place
                  </Button>
                </Link>
              </Card>
            ) : (
              <ol className="space-y-3" aria-label="Places you have contributed">
                {myPlaces.map((place) => {
                  const score = place.accessibilityScore;
                  const color = score !== undefined ? getScoreColor(score) : null;
                  const catLabel = PLACE_CATEGORIES[place.category as keyof typeof PLACE_CATEGORIES] || place.category;
                  const catIcon = CATEGORY_ICONS[place.category as keyof typeof CATEGORY_ICONS] || '📍';
                  return (
                    <li key={place._id.toString()}>
                      <Link
                        href={`/places/${place._id}`}
                        className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:shadow-card-hover transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                          {catIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 truncate">
                            {place.name}
                          </p>
                          <p className="text-xs text-slate-500">{catLabel} · {place.address}</p>
                        </div>
                        {score !== undefined && color && (
                          <span className={`text-sm font-bold ${scoreColorMap[color]}`}>
                            {score}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* My Reviews */}
          <section aria-labelledby="my-reviews-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="my-reviews-heading" className="text-lg font-semibold text-slate-900">
                Your Reviews
              </h2>
            </div>

            {myReviews.length === 0 ? (
              <Card className="flex flex-col items-center gap-4 py-10 text-center">
                <Star className="h-10 w-10 text-slate-300" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-slate-700">No reviews yet</p>
                  <p className="mt-1 text-sm text-slate-500">Share your accessibility experience!</p>
                </div>
                <Link href="/explore">
                  <Button variant="secondary">Explore Places</Button>
                </Link>
              </Card>
            ) : (
              <ol className="space-y-3" aria-label="Your submitted reviews">
                {myReviews.map((review) => {
                  const placeInfo = reviewPlaceMap.get(review.placeId.toString());
                  const catIcon = placeInfo
                    ? CATEGORY_ICONS[placeInfo.category as keyof typeof CATEGORY_ICONS] || '📍'
                    : '📍';
                  return (
                    <li key={review._id.toString()}>
                      <Link
                        href={`/places/${review.placeId}`}
                        className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:shadow-card-hover transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl">
                          {catIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 truncate">
                            {placeInfo?.name || 'Unknown Place'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{review.comment}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                          <span className="text-xs font-semibold text-amber-700">{review.rating}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
