import Link from 'next/link';
import { PlaceCard } from '@/components/places/PlaceCard';
import { formatAccessibilityPercentage, PLACE_CATEGORY_META } from '@/lib/accesslens/constants';
import { getCityPageData } from '@/lib/accesslens/data';

export default async function Home() {
  const cityData = await getCityPageData('victoria-bc');
  const featuredPlaces = cityData?.featuredPlaces ?? [];
  const categoryBreakdown = cityData?.categoryBreakdown ?? [];

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-white">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Accessibility intelligence for cities
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-tight text-gray-900">
              Find accessible places in your city.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-600">
              AccessLens is a community-driven platform for real-world accessibility evidence:
              entrances, ramps, washrooms, sidewalks, transit stops, parks, restaurants, movie
              theatres, public buildings, and more.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/victoria-bc"
                className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
              >
                Explore Victoria, BC
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-white px-6 py-3 text-base font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Join the community
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100/30">
            <h2 className="text-lg font-semibold text-gray-900">Victoria launch snapshot</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <dt className="text-sm text-gray-500">Places documented</dt>
                <dd className="mt-2 text-3xl font-bold text-gray-900">
                  {cityData?.places.length ?? 0}
                </dd>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <dt className="text-sm text-gray-500">Average access score</dt>
                <dd className="mt-2 text-3xl font-bold text-gray-900">
                  {formatAccessibilityPercentage(cityData?.averageAccessibilityScore ?? 0)}
                </dd>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 sm:col-span-2">
                <dt className="text-sm text-gray-500">Current categories</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {categoryBreakdown.map((entry) => (
                    <Link
                      key={entry.category}
                      href={`/victoria-bc/${entry.category}`}
                      className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      {PLACE_CATEGORY_META[entry.category].label} ({entry.count})
                    </Link>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Search places',
              copy: 'Browse places by city and category to understand entrances, washrooms, paths, and parking before you arrive.',
            },
            {
              title: 'Upload evidence',
              copy: 'Add photos that document ramps, sidewalks, automatic doors, barriers, and current construction conditions.',
            },
            {
              title: 'Share lived experience',
              copy: 'Add notes and reviews so the community can see what works, what does not, and what may have changed.',
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">{feature.title}</h2>
              <p className="mt-3 text-gray-600">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Featured places
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Launch collection for Victoria</h2>
          </div>
          <Link
            href="/explore"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            View all places
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredPlaces.map((place) => (
            <PlaceCard key={place._id.toString()} place={place} />
          ))}
        </div>
      </section>
    </div>
  );
}

