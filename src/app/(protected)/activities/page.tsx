import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/requireUser';
import { getCollection } from '@/lib/db/mongoClient';
import { Activity } from '@/models/Activity';
import { ObjectId } from 'mongodb';
import { formatDistanceToNow } from 'date-fns';

export const metadata: Metadata = { title: 'My Activity' };

const FEED_TYPES = [
  'review_created',
  'review_updated',
  'review_deleted',
  'place_created',
  'place_updated',
  'photo_uploaded',
] as const;

export default async function ActivitiesPage() {
  const user = await requireUser();
  if (!user?.id) redirect('/signin');

  const activitiesCollection = await getCollection<Activity>('activities');
  const activities = await activitiesCollection
    .find({ userId: new ObjectId(user.id), type: { $in: [...FEED_TYPES] } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Activity</h1>
        <p className="mt-1 text-sm text-slate-600">A timeline of what you’ve done in AccessLens.</p>
      </div>

      <div className="rounded-2xl panel-surface p-6">
        {activities.length === 0 ? (
          <div className="text-sm text-slate-600">
            No map or review activity yet. Try adding a place, uploading photos, or leaving a review from{' '}
            <Link href="/explore" className="font-medium text-primary-600 hover:text-primary-700">
              Explore
            </Link>
            .
          </div>
        ) : (
          <ol className="divide-y divide-slate-100" aria-label="Your recent activity">
            {activities.map((a) => (
              <li key={a._id.toString()} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{a.message}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {a.type.replaceAll('_', ' ')}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

