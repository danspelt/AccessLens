import { getCollection } from '@/lib/db/mongoClient';
import type {
  SiteContent,
  SiteContentKey,
  SiteContentPayloadMap,
} from '@/models/SiteContent';

/**
 * Fetch a single site-content block by key. Returns null when not yet seeded.
 * Callers should provide a fallback for first-run/missing content.
 */
export async function getSiteContent<K extends SiteContentKey>(
  key: K
): Promise<SiteContentPayloadMap[K] | null> {
  const collection = await getCollection<SiteContent>('site_content');
  const doc = await collection.findOne({ key });
  return (doc?.data as SiteContentPayloadMap[K] | undefined) ?? null;
}

/** Batch fetch multiple site-content blocks in one round-trip. */
export async function getSiteContentBatch<K extends SiteContentKey>(
  keys: readonly K[]
): Promise<Partial<{ [P in K]: SiteContentPayloadMap[P] }>> {
  if (keys.length === 0) return {};
  const collection = await getCollection<SiteContent>('site_content');
  const docs = await collection.find({ key: { $in: [...keys] } }).toArray();
  const result = {} as Partial<{ [P in K]: SiteContentPayloadMap[P] }>;
  for (const doc of docs) {
    (result as Record<string, unknown>)[doc.key] = doc.data;
  }
  return result;
}
