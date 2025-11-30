import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ObjectId } from 'mongodb';

async function getUserPlaces(userId: ObjectId) {
  const placesCollection = await getCollection<Place>('places');
  const places = await placesCollection
    .find({ createdByUserId: userId })
    .sort({ createdAt: -1 })
    .toArray();
  return places;
}

async function getUserReviews(userId: ObjectId) {
  const reviewsCollection = await getCollection<Review>('reviews');
  const placesCollection = await getCollection<Place>('places');

  const reviews = await reviewsCollection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  // Enrich reviews with place names
  const reviewsWithPlaces = await Promise.all(
    reviews.map(async (review) => {
      const place = await placesCollection.findOne({ _id: review.placeId });
      return {
        ...review,
        placeName: place?.name || 'Unknown Place',
        placeId: place?._id.toString(),
      };
    })
  );

  return reviewsWithPlaces;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const userId = user._id;
  const places = await getUserPlaces(userId);
  const reviews = await getUserReviews(userId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user.name}!</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Your Places */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Contributed Places ({places.length})
            </h2>
            <Link
              href="/add-place"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Place
            </Link>
          </div>
          {places.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
              <p className="text-gray-500 mb-4">You haven't added any places yet.</p>
              <Link
                href="/add-place"
                className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Your First Place
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {places.map((place) => (
                <Link
                  key={place._id.toString()}
                  href={`/places/${place._id.toString()}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900">{place.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {place.city}
                    {place.province && `, ${place.province}`}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Added {new Date(place.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Your Reviews */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
              <p className="text-gray-500">You haven't written any reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id.toString()}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      href={`/places/${review.placeId}`}
                      className="font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {review.placeName}
                    </Link>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-900 mr-1">
                        {review.rating}
                      </span>
                      <span className="text-yellow-400 text-sm">★</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

