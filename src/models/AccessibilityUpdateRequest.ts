import { ObjectId } from 'mongodb';

export type UpdateRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export const UPDATE_REQUEST_STATUS_LABELS: Record<UpdateRequestStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export interface AccessibilityUpdateRequest {
  _id: ObjectId;
  placeId: ObjectId;
  placeName: string;

  updatedChecklist: Record<string, boolean>;
  updatedNotes?: string;
  photoUrls: string[];

  submittedBy: {
    userId: ObjectId;
    name: string;
    email: string;
  };

  status: UpdateRequestStatus;

  reviewedBy: ObjectId | null;
  reviewedAt: Date | null;
  reviewNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}
