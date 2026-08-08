import { ObjectId } from 'mongodb';

export type ActivityType =
  | 'favorite_added'
  | 'favorite_removed'
  | 'review_created'
  | 'review_updated'
  | 'review_deleted'
  | 'review_verified'
  | 'place_created'
  | 'place_updated'
  | 'photo_uploaded'
  | 'photo_approved'
  | 'photo_rejected'
  | 'settings_updated'
  | 'place_submitted'
  | 'place_submission_approved'
  | 'place_submission_rejected'
  | 'accessibility_update_submitted'
  | 'business_claim_submitted'
  | 'outreach_publish'
  | 'outreach_reject'
  | 'outreach_mark_student_verified';

export interface Activity {
  _id: ObjectId;
  userId: ObjectId;
  type: ActivityType;
  entityType: 'place' | 'review' | 'photo' | 'user' | 'favorite' | 'submission' | 'claim';
  entityId: ObjectId;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

