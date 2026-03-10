import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaceCard } from '@/components/places/PlaceCard';
import { getCityDefinition, PLACE_CATEGORIES, PLACE_CATEGORY_META } from '@/lib/accesslens/constants';
import { listPlaces } from '@/lib/accesslens/data';
import { PlaceCategory } from '@/models/Place';

interface CategoryPageProps {
  params: Promise<{ citySlug: string; category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { citySlug, category } = await params;
  const city = getCityDefinition(citySlug);

  if (!city || !PLACE_CATEGORIES.includes(category as PlaceCategory)) {
    notFound();
  }

  const normalizedCategory = category as PlaceCategory;
  const places = await listPlaces({
    citySlug,
    category: normalizedCategory,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href={`/${citySlug}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Back to {city.name}
        </Link>
        <h1 className="mt-3 text-4xl font-bold text-gray-900">
          {PLACE_CATEGORY_META[normalizedCategory].label} in {city.name}
        </h1>
        <p className="mt-3 max-w-3xl text-gray-600">
          {PLACE_CATEGORY_META[normalizedCategory].description}
        </p>
      </div>

      {places.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-gray-900">No places yet in this category</h2>
          <p className="mt-3 text-gray-600">
            The city launch is still growing. Community submissions will fill in this category over
            time.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Category overview
            </p>
            <div className="mt-4 flex flex-wrap gap-6">
              <div>
                <p className="text-sm text-gray-500">Places tracked</p>
                <p className="text-2xl font-bold text-gray-900">{places.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average access score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    (places.reduce((sum, place) => sum + place.accessibilityScore, 0) / places.length) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => (
              <PlaceCard key={place._id.toString()} place={place} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
