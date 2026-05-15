import type { Collection, ObjectId } from 'mongodb';
import slugify from 'slugify';
import type { Place } from '@/models/Place';

export function slugFromPlaceName(name: string): string {
  return slugify(name, { lower: true, strict: true, trim: true });
}

export async function ensureUniquePlaceSlug(
  collection: Collection<Place>,
  name: string,
  excludeId?: ObjectId
): Promise<string> {
  const base = slugFromPlaceName(name) || 'place';
  let candidate = base;
  let n = 0;
  for (;;) {
    const existing = await collection.findOne(
      excludeId ? { slug: candidate, _id: { $ne: excludeId } } : { slug: candidate }
    );
    if (!existing) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}
