import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/requireUser';
import { getCollection } from '@/lib/db/mongoClient';
import { Favorite } from '@/models/Favorite';
import { Place } from '@/models/Place';
import { ObjectId } from 'mongodb';

export const metadata: Metadata = { title: 'Favorites' };

export default async function FavoritesPage() {
  const user = await requireUser();
  if (!user?.id) redirect('/login');

  const favoritesCollection = await getCollection<Favorite>('favorites');
  const placesCollection = await getCollection<Place>('places');

  const favs = await favoritesCollection
    .find({ userId: new ObjectId(user.id) })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const placeIds = favs.map((f) => f.placeId);
  const places =
    placeIds.length > 0
      ? await placesCollection
          .find({ _id: { $in: placeIds } })
          .project({ _id: 1, name: 1, address: 1, city: 1, province: 1, accessibilityScore: 1 })
          .toArray()
      : [];

  const placeMap = new Map(places.map((p) => [p._id.toString(), p]));
  const favorites = favs
    .map((f) => {
      const place = placeMap.get(f.placeId.toString());
      if (!place) return null;
      return {
        id: f._id.toString(),
        placeId: f.placeId.toString(),
        createdAt: f.createdAt.toISOString(),
        place: {
          id: place._id.toString(),
          name: (place as unknown as Place).name,
          address: (place as unknown as Place).address,
          city: (place as unknown as Place).city,
          province: (place as unknown as Place).province,
          accessibilityScore: (place as unknown as Place).accessibilityScore,
        },
      };
    })
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Favorites</h1>
        <p className="mt-1 text-sm text-slate-600">Saved places you want to revisit.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        {favorites.length === 0 ? (
          <div className="text-sm text-slate-600">
            You haven’t saved any places yet.{' '}
            <Link href="/explore" className="font-medium text-primary-600 hover:text-primary-700">
              Explore places
            </Link>
            .
          </div>
        ) : (
          <ol className="space-y-2" aria-label="Your favorite places">
            {favorites.map((f) => (
              <li key={f!.id}>
                <Link
                  href={`/places/${f!.placeId}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-primary-700 truncate">
                      {f!.place.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">
                      {f!.place.address} · {f!.place.city}, {f!.place.province}
                    </p>
                  </div>
                  {f!.place.accessibilityScore !== undefined && (
                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800">
                      {f!.place.accessibilityScore}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

