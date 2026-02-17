import { ObjectId } from 'mongodb';

export type AccessibilityAnswer = 'yes' | 'no' | 'partial' | 'unknown';

export interface Review {
  _id: ObjectId;
  placeId: ObjectId;
  userId: ObjectId;
  rating: number; // 1-5
  comment: string;
  // Accessibility report fields
  stepFreeEntrance?: AccessibilityAnswer;
  ramp?: AccessibilityAnswer;
  accessibleWashroom?: AccessibilityAnswer;
  elevator?: AccessibilityAnswer;
  accessibleParking?: AccessibilityAnswer;
  confidence?: number; // 1-5
  photoUrls?: string[]; // Deprecated - use photoIds instead
  photoIds?: string[]; // GridFS file IDs
  createdAt: Date;
  updatedAt: Date;
}

