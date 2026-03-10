import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCollection } from '@/lib/db/mongoClient';
import { Place, PLACE_CATEGORIES, CATEGORY_ICONS } from '@/models/Place';
import { Review } from '@/models/Review';
import { PlaceCard } from '@/components/places/PlaceCard';
import { ArrowLeft, MapPin } from 'lucide-react';

interface Props {
  params: Promise<{ citySlug: string; category: string }>;
}

const CITY_NAMES: Record<string, string> = {
  'victoria-bc': 'Victoria, BC',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug, category } = await params;
  const cityName = CITY_NAMES[citySlug] || citySlug;
  const catLabel = PLACE_CATEGORIES[category as keyof typeof PLACE_CATEGORIES];
  if (!catLabel) return {};
  return {
    title: `${catLabel}s in ${cityName} — Accessibility`,
    description: `Find accessible ${catLabel.toLowerCase()}s in ${cityName}. View accessibility scores, photos, and community reviews.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { citySlug, category } = await params;

  const catLabel = PLACE_CATEGORIES[category as keyof typeof PLACE_CATEGORIES];
  if (!catLabel) notFound();

  const cityName = CITY_NAMES[citySlug] || citySlug;
  const catIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📍';

  const placesCollection = await getCollection<Place>('places');
  const reviewsCollection = await getCollection<Review>('reviews');

  const places = await placesCollection
    .find({ citySlug, category: category as Place['category'] })
    .sort({ accessibilityScore: -1, createdAt: -1 })
    .toArray();

  // Get avg ratings
  const placeIds = places.map((p) => p._id);
  const reviews = placeIds.length > 0
    ? await reviewsCollection
        .find({ placeId: { $in: placeIds } })
        .project({ placeId: 1, rating: 1 })
        .toArray()
    : [];

  const ratingMap = new Map<string, { sum: number; count: number }>();
  reviews.forEach((r) => {
    const key = r.placeId.toString();
    const cur = ratingMap.get(key) || { sum: 0, count: 0 };
    ratingMap.set(key, { sum: cur.sum + r.rating, count: cur.count + 1 });
  });

  const enrichedPlaces = places.map((p) => {
    const ratingData = ratingMap.get(p._id.toString());
    return {
      ...p,
      _id: p._id.toString(),
      createdByUserId: p.createdByUserId.toString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      avgRating: ratingData
        ? Math.round((ratingData.sum / ratingData.count) * 10) / 10
        : null,
      reviewCount: ratingData?.count || 0,
    };
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={`/cities/${citySlug}`} className="hover:text-primary-600">{cityName}</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-slate-900 font-medium" aria-current="page">{catLabel}s</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-hidden="true">{catIcon}</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {catLabel}s in {cityName}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {places.length} place{places.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {enrichedPlaces.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <span className="text-5xl" role="img" aria-hidden="true">{catIcon}</span>
            <div>
              <p className="text-lg font-semibold text-slate-700">No {catLabel.toLowerCase()}s added yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Help the community by adding accessibility information for {catLabel.toLowerCase()}s in {cityName}.
              </p>
            </div>
            <Link
              href="/add-place"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              Add a {catLabel}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enrichedPlaces.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href={`/cities/${citySlug}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to {cityName}
          </Link>
        </div>
      </div>
    </div>
  );
}
