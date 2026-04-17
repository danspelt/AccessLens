import { getCollection } from '@/lib/db/mongoClient';
import type { City } from '@/models/City';

/** Returns all active cities, ordered by `order` ascending then name. */
export async function getActiveCities(): Promise<City[]> {
  const collection = await getCollection<City>('cities');
  return collection.find({ isActive: true }).sort({ order: 1, name: 1 }).toArray();
}

/** Returns a single active city by slug, or null if not found/inactive. */
export async function getCityBySlug(slug: string): Promise<City | null> {
  const collection = await getCollection<City>('cities');
  return collection.findOne({ slug, isActive: true });
}
