import { ObjectId } from 'mongodb';

export interface Favorite {
  _id: ObjectId;
  userId: ObjectId;
  placeId: ObjectId;
  createdAt: Date;
}

