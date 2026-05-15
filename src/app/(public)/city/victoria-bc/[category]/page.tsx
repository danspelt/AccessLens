import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaceCard } from '@/components/places/PlaceCard';
import { getPlacesWithRatings } from '@/lib/places/directory';
import { PlaceCategory } from '@/models/Place';

const PLACE_CATEGORIES: PlaceCategory[] = [
  'arena',
  'pool',
  'rink',
  'park',
  'sidewalk',
  'business',
  'other',
];

const categoryTitle: Record<PlaceCategory, string> = {
  arena: 'Arenas',
  pool: 'Pools',
  rink: 'Rinks',
  park: 'Parks',
  sidewalk: 'Sidewalks & paths',
  business: 'Businesses',
  other: 'Other places',
};

interface VictoriaCategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function VictoriaCategoryPage({ params }: VictoriaCategoryPageProps) {
  const { category } = await params;
  if (!PLACE_CATEGORIES.includes(category as PlaceCategory)) {
    notFound();
  }

  const cat = category as PlaceCategory;
  const placesWithRatings = await getPlacesWithRatings({
    category: cat,
    city: 'Victoria',
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-gray-500">
        <Link href="/city/victoria-bc" className="hover:text-gray-800">
          Victoria, BC
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-gray-900">{categoryTitle[cat]}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">
        {categoryTitle[cat]} in Victoria
      </h1>
      <p className="mt-2 text-gray-600">
        Listings with city set to Victoria.{' '}
        <Link href="/places?city=Victoria" className="font-medium text-blue-700 hover:underline">
          Filter on the main directory
        </Link>{' '}
        for combined search and accessibility filters.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placesWithRatings.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-gray-600">
            No places in this category yet for Victoria.
          </div>
        ) : (
          placesWithRatings.map(({ place, avgRating, reviewCount }) => (
            <PlaceCard
              key={place._id.toString()}
              place={place}
              avgRating={avgRating}
              reviewCount={reviewCount}
            />
          ))
        )}
      </div>
    </div>
  );
}
