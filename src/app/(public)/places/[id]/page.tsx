import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';
import { PlaceSnapshot, SnapshotFieldName } from '@/models/PlaceSnapshot';
import { ReportVote } from '@/models/ReportVote';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

async function getPlace(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const placesCollection = await getCollection<Place>('places');
  const place = await placesCollection.findOne({ _id: new ObjectId(id) });
  return place;
}

async function getPlaceReviews(placeId: ObjectId) {
  const reviewsCollection = await getCollection<Review>('reviews');
  const usersCollection = await getCollection<User>('users');
  const reportVotesCollection = await getCollection<ReportVote>('report_votes');

  const reviews = await reviewsCollection
    .find({ placeId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const reviewIds = reviews.map((r) => r._id);
  const voteCounts =
    reviewIds.length === 0
      ? []
      : await reportVotesCollection
          .aggregate([
            { $match: { reviewId: { $in: reviewIds } } },
            {
              $group: {
                _id: { reviewId: '$reviewId', value: '$value' },
                count: { $sum: 1 },
              },
            },
          ])
          .toArray();

  const voteMap = new Map<string, { helpful: number; notHelpful: number }>();
  for (const row of voteCounts as Array<{
    _id: { reviewId: ObjectId; value: 1 | -1 };
    count: number;
  }>) {
    const key = row._id.reviewId.toString();
    const current = voteMap.get(key) ?? { helpful: 0, notHelpful: 0 };
    if (row._id.value === 1) current.helpful = row.count;
    if (row._id.value === -1) current.notHelpful = row.count;
    voteMap.set(key, current);
  }

  // Enrich reviews with user names
  const reviewsWithUsers = await Promise.all(
    reviews.map(async (review) => {
      const user = await usersCollection.findOne({ _id: review.userId });
      return {
        ...review,
        userName: user?.name || 'Anonymous',
        voteCounts: voteMap.get(review._id.toString()) ?? { helpful: 0, notHelpful: 0 },
      };
    })
  );

  return reviewsWithUsers;
}

async function getPlaceSnapshot(placeId: ObjectId) {
  const snapshotsCollection = await getCollection<PlaceSnapshot>('place_snapshots');
  return snapshotsCollection.findOne({ placeId });
}

function formatSnapshotValue(value: unknown) {
  if (value === 'yes') return 'Yes';
  if (value === 'no') return 'No';
  if (value === 'partial') return 'Partial';
  if (value === 'unknown') return 'Unknown';
  return '—';
}

function labelForField(field: SnapshotFieldName) {
  const map: Record<SnapshotFieldName, string> = {
    stepFreeEntrance: 'Step-free entrance',
    ramp: 'Ramp',
    accessibleWashroom: 'Accessible washroom',
    elevator: 'Elevator',
    accessibleParking: 'Accessible parking',
  };
  return map[field];
}

interface PlacePageProps {
  params: Promise<{ id: string }>;
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { id } = await params;
  const place = await getPlace(id);

  if (!place) {
    notFound();
  }

  const reviews = await getPlaceReviews(place._id);
  const snapshot = await getPlaceSnapshot(place._id);
  const user = await getCurrentUser();

  const categoryLabels: Record<Place['category'], string> = {
    arena: 'Arena',
    pool: 'Pool',
    rink: 'Rink',
    park: 'Park',
    sidewalk: 'Sidewalk',
    business: 'Business',
    other: 'Other',
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{place.name}</h1>
        <p className="mt-2 text-lg text-gray-600">
          {categoryLabels[place.category]} • {place.city}
          {place.province && `, ${place.province}`}
        </p>
        <p className="mt-1 text-gray-700">{place.address}</p>

        {avgRating !== undefined && (
          <div className="mt-4">
            <span className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
            <span className="ml-2 text-gray-600">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Community Snapshot</h2>
          {snapshot?.signals && (
            <p className="text-sm text-gray-500">
              Updated {new Date(snapshot.lastComputedAt).toLocaleDateString('en-US')} •{' '}
              {snapshot.signals.reportCount} report{snapshot.signals.reportCount === 1 ? '' : 's'}
            </p>
          )}
        </div>

        {!snapshot ? (
          <p className="mt-3 text-sm text-gray-600">No snapshot yet. Add a report to help build one.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                'stepFreeEntrance',
                'ramp',
                'accessibleWashroom',
                'elevator',
                'accessibleParking',
              ] as const
            ).map((field) => {
              const value = snapshot.fields?.[field];
              const isConflict = Boolean(snapshot.conflicts?.[field]);

              return (
                <div key={field} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900">{labelForField(field)}</p>
                    {isConflict && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Conflicting
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{formatSnapshotValue(value)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {place.description && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700">{place.description}</p>
        </div>
      )}

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Accessibility Features</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <span
              className={`mr-2 ${place.stepFreeAccess ? 'text-green-600' : 'text-gray-400'}`}
            >
              {place.stepFreeAccess ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Step-free access</span>
          </div>
          <div className="flex items-center">
            <span
              className={`mr-2 ${place.accessibleWashroom ? 'text-green-600' : 'text-gray-400'}`}
            >
              {place.accessibleWashroom ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Accessible washroom</span>
          </div>
          <div className="flex items-center">
            <span
              className={`mr-2 ${place.accessibleParking ? 'text-green-600' : 'text-gray-400'}`}
            >
              {place.accessibleParking ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Accessible parking</span>
          </div>
          <div className="flex items-center">
            <span className={`mr-2 ${place.indoor ? 'text-blue-600' : 'text-gray-400'}`}>
              {place.indoor ? '✓' : '✗'}
            </span>
            <span className="text-gray-700">Indoor</span>
          </div>
        </div>
      </div>

      {user && (
        <div className="mb-8">
          <ReviewForm placeId={id} />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Reviews ({reviews.length})
        </h2>
        <ReviewList reviews={reviews} currentUserId={user?._id.toString()} />
      </div>
    </div>
  );
}

