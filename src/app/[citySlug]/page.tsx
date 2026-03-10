import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaceCard } from '@/components/places/PlaceCard';
import { formatAccessibilityPercentage, PLACE_CATEGORY_META } from '@/lib/accesslens/constants';
import { getCityPageData } from '@/lib/accesslens/data';

interface CityPageProps {
  params: Promise<{ citySlug: string }>;
}

export default async function CityPage({ params }: CityPageProps) {
  const { citySlug } = await params;
  const cityData = await getCityPageData(citySlug);

  if (!cityData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-blue-600 px-8 py-12 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
          Launch city
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          {cityData.city.name}, {cityData.city.province}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-blue-50">{cityData.city.launchNotes}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-5">
            <p className="text-sm text-blue-100">Places tracked</p>
            <p className="mt-2 text-3xl font-bold">{cityData.places.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5">
            <p className="text-sm text-blue-100">Average access score</p>
            <p className="mt-2 text-3xl font-bold">
              {formatAccessibilityPercentage(cityData.averageAccessibilityScore)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5">
            <p className="text-sm text-blue-100">Live categories</p>
            <p className="mt-2 text-3xl font-bold">{cityData.categoryBreakdown.length}</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse by category</h2>
            <p className="mt-2 text-gray-600">
              Start with the kinds of places you visit most often in the city.
            </p>
          </div>
          <Link
            href="/explore"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Explore all cities
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cityData.categoryBreakdown.map((entry) => (
            <Link
              key={entry.category}
              href={`/${cityData.city.slug}/${entry.category}`}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                {entry.count} places
              </p>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">
                {PLACE_CATEGORY_META[entry.category].label}
              </h3>
              <p className="mt-2 text-gray-600">{PLACE_CATEGORY_META[entry.category].description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured places in {cityData.city.name}</h2>
          <p className="mt-2 text-gray-600">
            Community-rated places with the strongest documented accessibility coverage so far.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cityData.featuredPlaces.map((place) => (
            <PlaceCard key={place._id.toString()} place={place} />
          ))}
        </div>
      </section>
    </div>
  );
}
