import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getCollection } from '@/lib/db/mongoClient';
import { Place, PLACE_CATEGORIES, getScoreColor } from '@/models/Place';

export const metadata: Metadata = { title: 'My Places' };

export default async function MyPlacesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin');

  const placesCollection = await getCollection<Place>('places');
  const myPlaces = await placesCollection
    .find({ createdByUserId: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Places</h1>
        <p className="mt-1 text-sm text-slate-600">Places you’ve added to AccessLens.</p>
      </div>

      <div className="rounded-2xl panel-surface p-6">
        {myPlaces.length === 0 ? (
          <div className="text-sm text-slate-600">
            You haven’t added any places yet.{' '}
            <Link className="text-primary-600 hover:text-primary-700 font-medium" href="/add-place">
              Add a place
            </Link>.
          </div>
        ) : (
          <ol className="space-y-2">
            {myPlaces.map((p) => {
              const score = p.accessibilityScore;
              const color = score === undefined ? null : getScoreColor(score);
              const scoreClass =
                color === 'green'
                  ? 'text-green-700 bg-green-50 border-green-200'
                  : color === 'yellow'
                    ? 'text-yellow-800 bg-yellow-50 border-yellow-200'
                    : color === 'red'
                      ? 'text-red-700 bg-red-50 border-red-200'
                      : 'text-slate-700 bg-slate-50 border-slate-200';

              return (
                <li key={p._id.toString()}>
                  <Link
                    href={`/places/${p._id.toString()}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-primary-700 truncate">{p.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500 truncate">
                        {PLACE_CATEGORIES[p.category] || p.category} · {p.address}
                      </p>
                    </div>
                    {score !== undefined && (
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${scoreClass}`}>
                        {score}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

