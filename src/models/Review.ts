import { ObjectId } from 'mongodb';

export interface Review {
  _id: ObjectId;
  placeId: ObjectId;
  userId: ObjectId;
  rating: number; // 1-5
  comment: string;
  photoUrls?: string[];
  /** Short accessibility clips (stored like photos under /public/uploads) */
  videoUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

