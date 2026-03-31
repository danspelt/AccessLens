import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getCollection } from '@/lib/db/mongoClient';
import { Review } from '@/models/Review';
import { Place } from '@/models/Place';
import { ObjectId } from 'mongodb';
import { MyReviewsToolbar } from './toolbar';

export const metadata: Metadata = { title: 'My Reviews' };

export default async function MyReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const reviewsCollection = await getCollection<Review>('reviews');
  const placesCollection = await getCollection<Place>('places');

  const myReviews = await reviewsCollection
    .find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const placeIds = [...new Set(myReviews.map((r) => r.placeId.toString()))];
  const places = placeIds.length
    ? await placesCollection
        .find({ _id: { $in: placeIds.map((id) => new ObjectId(id)) } })
        .project({ _id: 1, name: 1 })
        .toArray()
    : [];
  const placeMap = new Map(places.map((p) => [p._id.toString(), (p as unknown as Place).name]));

  return (
    <div className="space-y-4">
      <MyReviewsToolbar />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        {myReviews.length === 0 ? (
          <div className="text-sm text-slate-600">
            You haven’t written any reviews yet. <Link className="text-primary-600 hover:text-primary-700 font-medium" href="/explore">Explore places</Link>.
          </div>
        ) : (
          <ol className="divide-y divide-slate-100">
            {myReviews.map((r) => (
              <li key={r._id.toString()} className="py-4">
                <Link href={`/places/${r.placeId.toString()}`} className="group block">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900 group-hover:text-primary-700 truncate">
                      {placeMap.get(r.placeId.toString()) || 'Unknown Place'}
                    </p>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                      {r.rating}★
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{r.comment}</p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

