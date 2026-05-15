import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { ObjectId } from 'mongodb';

const OBJECT_ID_HEX = /^[a-fA-F0-9]{24}$/;

export function looksLikeMongoObjectId(param: string): boolean {
  return OBJECT_ID_HEX.test(param);
}

export async function getPlaceBySlugOrId(param: string): Promise<Place | null> {
  const placesCollection = await getCollection<Place>('places');

  if (looksLikeMongoObjectId(param) && ObjectId.isValid(param)) {
    const byId = await placesCollection.findOne({ _id: new ObjectId(param) });
    if (byId) return byId;
  }

  return placesCollection.findOne({ slug: param });
}
