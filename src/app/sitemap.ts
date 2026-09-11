import type { MetadataRoute } from 'next';
import type { Filter } from 'mongodb';
import { getActiveCities } from '@/lib/db/cities';
import { getCollection } from '@/lib/db/mongoClient';
import type { Place } from '@/models/Place';
import { absoluteUrl } from '@/lib/seo';

const staticPages: MetadataRoute.Sitemap = [
  { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
  { url: absoluteUrl('/explore'), changeFrequency: 'daily', priority: 0.9 },
  { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.6 },
  { url: absoluteUrl('/for-businesses'), changeFrequency: 'monthly', priority: 0.7 },
  {
    url: absoluteUrl('/official-data/accessible-parking'),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  { url: absoluteUrl('/privacy'), changeFrequency: 'yearly', priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const placesCollection = await getCollection<Place>('places');
    const publicPlaceFilter: Filter<Place> = {
      $or: [{ status: 'active' }, { status: { $exists: false } }],
    };
    const [cities, places, categoryRows] = await Promise.all([
      getActiveCities(),
      placesCollection
        .find(publicPlaceFilter)
        .project({ _id: 1, updatedAt: 1 })
        .toArray(),
      placesCollection
        .aggregate<{ citySlug: string; category: string; updatedAt?: Date }>([
          { $match: publicPlaceFilter },
          {
            $group: {
              _id: { citySlug: '$citySlug', category: '$category' },
              updatedAt: { $max: '$updatedAt' },
            },
          },
          {
            $project: {
              _id: 0,
              citySlug: '$_id.citySlug',
              category: '$_id.category',
              updatedAt: 1,
            },
          },
        ])
        .toArray(),
    ]);

    const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
      url: absoluteUrl(`/cities/${city.slug}`),
      lastModified: city.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const categoryPages: MetadataRoute.Sitemap = categoryRows.map((row) => ({
      url: absoluteUrl(`/cities/${row.citySlug}/${row.category}`),
      lastModified: row.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const placePages: MetadataRoute.Sitemap = places.map((place) => ({
      url: absoluteUrl(`/places/${place._id.toString()}`),
      lastModified: place.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticPages, ...cityPages, ...categoryPages, ...placePages];
  } catch {
    return staticPages;
  }
}
