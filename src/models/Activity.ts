import { ObjectId } from 'mongodb';

export type ActivityType =
  | 'favorite_added'
  | 'favorite_removed'
  | 'review_created'
  | 'review_updated'
  | 'review_deleted'
  | 'place_created'
  | 'place_updated'
  | 'photo_uploaded'
  | 'settings_updated';

export interface Activity {
  _id: ObjectId;
  userId: ObjectId;
  type: ActivityType;
  entityType: 'place' | 'review' | 'photo' | 'user' | 'favorite';
  entityId: ObjectId;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

