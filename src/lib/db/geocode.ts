import { getCollection } from '@/lib/db/mongoClient';
import { GeocodeCacheEntry } from '@/models/GeocodeCache';

function normalizeQuery(q: string): string {
  return q
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function buildGeocodeQuery(input: {
  address?: string;
  city?: string;
  province?: string;
  country?: string;
}): string {
  const parts = [
    input.address,
    input.city,
    input.province,
    input.country,
  ]
    .map((p) => (p || '').trim())
    .filter(Boolean);
  return parts.join(', ');
}

export async function getCachedGeocode(q: string) {
  const normalized = normalizeQuery(q);
  const col = await getCollection<GeocodeCacheEntry>('geocode_cache');
  return await col.findOne({ q: normalized, expiresAt: { $gt: new Date() } });
}

export async function setCachedGeocode(q: string, result: GeocodeCacheEntry['result'], ttlDays = 30) {
  const normalized = normalizeQuery(q);
  const col = await getCollection<GeocodeCacheEntry>('geocode_cache');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
  await col.updateOne(
    { q: normalized },
    { $set: { q: normalized, result, createdAt: now, expiresAt } },
    { upsert: true }
  );
}

