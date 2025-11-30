import { ObjectId } from 'mongodb';

export interface Review {
  _id: ObjectId;
  placeId: ObjectId;
  userId: ObjectId;
  rating: number; // 1-5
  comment: string;
  photoUrls?: string[]; // Deprecated - use photoIds instead
  photoIds?: string[]; // GridFS file IDs
  createdAt: Date;
  updatedAt: Date;
}

