import { ObjectId } from 'mongodb';

export interface Follow {
  _id: ObjectId;
  userId: ObjectId;
  entityType: 'place';
  entityId: ObjectId;
  createdAt: Date;
}
