import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getCollection } from '@/lib/db/mongoClient';
import { Place, PLACE_CATEGORIES } from '@/models/Place';
import { Review } from '@/models/Review';
import { Activity } from '@/models/Activity';
import DashboardClient, { type DashboardActivityItem, type DashboardStats, type DashboardPlaceItem, type DashboardReviewItem } from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const placesCollection = await getCollection<Place>('places');
  const reviewsCollection = await getCollection<Review>('reviews');
  const activitiesCollection = await getCollection<Activity>('activities');

  const [placesCount, reviewsCount, myPlaces, myReviews, recentActivities] = await Promise.all([
    placesCollection.countDocuments({ createdByUserId: user._id }),
    reviewsCollection.countDocuments({ userId: user._id }),
    placesCollection.find({ createdByUserId: user._id }).sort({ createdAt: -1 }).limit(20).toArray(),
    reviewsCollection.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).toArray(),
    activitiesCollection.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).toArray(),
  ]);

  // Enrich reviews with place names
  const reviewPlaceIds = myReviews.map((r) => r.placeId);
  const reviewPlaces = await placesCollection
    .find({ _id: { $in: reviewPlaceIds } })
    .project({ _id: 1, name: 1, category: 1 })
    .toArray();
  const reviewPlaceMap = new Map(
    reviewPlaces.map((p) => [p._id.toString(), { name: (p as unknown as Place).name, category: (p as unknown as Place).category }])
  );

  const places: DashboardPlaceItem[] = myPlaces.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    address: p.address,
    category: p.category,
    categoryLabel: PLACE_CATEGORIES[p.category] || p.category,
    accessibilityScore: p.accessibilityScore,
    createdAt: p.createdAt.toISOString(),
  }));

  const reviews: DashboardReviewItem[] = myReviews.map((r) => ({
    id: r._id.toString(),
    placeId: r.placeId.toString(),
    placeName: reviewPlaceMap.get(r.placeId.toString())?.name || 'Unknown Place',
    placeCategory: reviewPlaceMap.get(r.placeId.toString())?.category || 'other',
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));

  const avgRating =
    myReviews.length > 0
      ? Math.round((myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length) * 10) / 10
      : null;

  const latestContributionAt = (() => {
    const lastPlace = myPlaces[0]?.createdAt?.getTime() ?? 0;
    const lastReview = myReviews[0]?.createdAt?.getTime() ?? 0;
    const ts = Math.max(lastPlace, lastReview);
    return ts ? new Date(ts).toISOString() : null;
  })();

  const stats: DashboardStats = {
    placesCount,
    reviewsCount,
    avgRating,
    latestContributionAt,
  };

  const activity: DashboardActivityItem[] = recentActivities.slice(0, 10).map((a) => {
    const href =
      a.entityType === 'place' ? `/places/${a.entityId.toString()}` : a.entityType === 'review' ? `/my-reviews` : '/activities';
    return {
      type: a.entityType === 'review' ? 'review' : 'place',
      id: a._id.toString(),
      title: a.message,
      subtitle: typeof a.metadata?.placeName === 'string' ? a.metadata.placeName : a.type.replaceAll('_', ' '),
      href,
      createdAt: a.createdAt.toISOString(),
    };
  });

  return (
    <DashboardClient
      userName={user.name}
      stats={stats}
      activity={activity}
      places={places}
      reviews={reviews}
    />
  );
}
