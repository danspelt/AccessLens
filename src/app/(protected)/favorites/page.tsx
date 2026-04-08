import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/requireUser';
import { getCollection } from '@/lib/db/mongoClient';
import { Favorite } from '@/models/Favorite';
import { Place } from '@/models/Place';
import { ObjectId } from 'mongodb';
import { PlaceCard } from '@/components/places/PlaceCard';

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
          .project({
            _id: 1,
            name: 1,
            category: 1,
            address: 1,
            city: 1,
            province: 1,
            accessibilityScore: 1,
            photoUrls: 1,
          })
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
          category: (place as unknown as Place).category,
          address: (place as unknown as Place).address,
          city: (place as unknown as Place).city,
          province: (place as unknown as Place).province,
          accessibilityScore: (place as unknown as Place).accessibilityScore,
          photoUrls: (place as unknown as Place).photoUrls,
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
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Your favorite places"
          >
            {favorites.map((f) => (
              <PlaceCard
                key={f!.id}
                place={{
                  _id: f!.placeId,
                  name: f!.place.name,
                  category: f!.place.category,
                  address: f!.place.address,
                  city: f!.place.city,
                  accessibilityScore: f!.place.accessibilityScore,
                  photoUrls: f!.place.photoUrls,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

