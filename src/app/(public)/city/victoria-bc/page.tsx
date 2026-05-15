import Link from 'next/link';
import { PlaceCategory } from '@/models/Place';

const CATEGORY_LINKS: { slug: PlaceCategory; label: string }[] = [
  { slug: 'park', label: 'Parks' },
  { slug: 'business', label: 'Businesses' },
  { slug: 'arena', label: 'Arenas' },
  { slug: 'pool', label: 'Pools' },
  { slug: 'rink', label: 'Rinks' },
  { slug: 'sidewalk', label: 'Sidewalks & paths' },
  { slug: 'other', label: 'Other' },
];

export default function VictoriaHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Local discovery</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Victoria, BC</h1>
      <p className="mt-4 text-lg text-gray-600">
        AccessLens is starting in Victoria: find accessibility information for places before you go.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        Accessibility information is provided by businesses, community members, and reviewers.
        Conditions may change—contact the place directly for critical access needs.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/places?city=Victoria"
          className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          View all places in Victoria
        </Link>
        <Link
          href="/places"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Full directory
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-gray-900">Browse by category</h2>
        <p className="mt-2 text-sm text-gray-600">Open a category to see listings in Victoria.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {CATEGORY_LINKS.map(({ slug, label }) => (
            <li key={slug}>
              <Link
                href={`/city/victoria-bc/${slug}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-900 shadow-sm transition-shadow hover:shadow-md"
              >
                {label}
                <span className="text-gray-400" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
