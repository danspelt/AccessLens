import { ObjectId } from 'mongodb';

export interface Review {
  _id: ObjectId;
  placeId: ObjectId;
  userId: ObjectId;
  rating: number;
  headline?: string;
  comment: string;
  accessibilityNotes?: string;
  photoUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

