import { ObjectId } from 'mongodb';

export interface Notification {
  _id: ObjectId;
  userId: ObjectId;
  type: 'place_updated';
  entityType: 'place';
  entityId: ObjectId;
  title: string;
  message: string;
  href: string;
  dedupeKey: string;
  readAt: Date | null;
  emailStatus: 'not_requested' | 'pending' | 'sent' | 'failed';
  emailError?: string;
  createdAt: Date;
}
