import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { isValidAccessCodeFormat, normalizeAccessCode } from '@/lib/access/codeFormat';

export async function findPlaceByAccessCode(rawCode: string): Promise<Place | null> {
  const code = normalizeAccessCode(rawCode);
  if (!isValidAccessCodeFormat(code)) return null;

  const places = await getCollection<Place>('places');
  const place = await places.findOne({ accessCode: code });
  if (!place) return null;

  if (place.accessCodeExpiresAt && place.accessCodeExpiresAt < new Date()) {
    return null;
  }

  return place;
}

export function serializePlaceForBusiness(place: Place) {
  return {
    id: place._id.toString(),
    name: place.name,
    address: place.address,
    city: place.city,
    province: place.province,
    category: place.category,
    outreachStatus: place.outreachStatus ?? 'unclaimed',
    verificationLevel: place.verificationLevel ?? null,
    partnerLabel: place.partnerLabel ?? null,
    businessContact: place.businessContact ?? null,
    accessibilityProfile: place.accessibilityProfile ?? null,
    accessibilityNotes: place.accessibilityNotes ?? null,
    photoUrls: place.photoUrls ?? [],
    isClaimed: place.isClaimed,
  };
}

export async function findPlaceById(id: string): Promise<Place | null> {
  if (!ObjectId.isValid(id)) return null;
  const places = await getCollection<Place>('places');
  return places.findOne({ _id: new ObjectId(id) });
}
