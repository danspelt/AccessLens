import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongoClient';
import { PlacePhoto } from '@/models/PlacePhoto';
import { Place } from '@/models/Place';

/** URLs approved for public display on a place profile. */
export async function getApprovedPhotoUrls(placeId: ObjectId | string): Promise<string[]> {
  const id = typeof placeId === 'string' ? new ObjectId(placeId) : placeId;
  const photosCol = await getCollection<PlacePhoto>('placePhotos');
  const placesCol = await getCollection<Place>('places');

  const [approved, place] = await Promise.all([
    photosCol.find({ placeId: id, status: 'approved' }).sort({ createdAt: -1 }).toArray(),
    placesCol.findOne({ _id: id }, { projection: { photoUrls: 1 } }),
  ]);

  const fromRecords = approved.map((p) => p.url);
  const legacy = place?.photoUrls ?? [];
  return [...new Set([...fromRecords, ...legacy])];
}

export async function createPendingBusinessPhotos(
  placeId: ObjectId,
  placeName: string,
  urls: string[],
  contact: { name: string; email: string }
): Promise<void> {
  if (urls.length === 0) return;

  const photosCol = await getCollection<PlacePhoto>('placePhotos');
  const now = new Date();

  const existing = await photosCol
    .find({ placeId, url: { $in: urls } })
    .project({ url: 1 })
    .toArray();
  const existingUrls = new Set(existing.map((p) => p.url));

  const toInsert = urls
    .filter((url) => !existingUrls.has(url))
    .map(
      (url) =>
        ({
          placeId,
          placeName,
          url,
          photoType: 'other' as const,
          status: 'pending' as const,
          uploadedBy: { type: 'business' as const, name: contact.name, email: contact.email },
          reviewedBy: null,
          reviewedAt: null,
          createdAt: now,
          updatedAt: now,
        }) satisfies Omit<PlacePhoto, '_id'>
    );

  if (toInsert.length > 0) {
    await photosCol.insertMany(toInsert as PlacePhoto[]);
  }
}
