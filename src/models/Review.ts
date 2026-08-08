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
  /** Set when a moderator verifies the review (verified_reviewer badge). */
  adminVerified?: boolean;
  verifiedBy?: ObjectId | null;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

