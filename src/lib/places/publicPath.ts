import type { Place } from '@/models/Place';

/**
 * Public URL segment for a place. Prefers slug when present; falls back to Mongo _id for legacy docs.
 */
export function placeDetailPath(place: Pick<Place, '_id' | 'slug'>): string {
  const key = place.slug?.trim() || place._id.toString();
  return `/places/${key}`;
}
