import { ObjectId } from 'mongodb';

export type ClaimRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export const CLAIM_STATUS_LABELS: Record<ClaimRequestStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export interface BusinessClaimRequest {
  _id: ObjectId;
  placeId: ObjectId;

  requestedBy: {
    userId: ObjectId;
    name: string;
    email: string;
    role: string;
  };

  verification: {
    businessEmail?: string;
    websiteDomainMatch?: boolean;
    uploadedProofUrl?: string;
    notes: string;
  };

  status: ClaimRequestStatus;

  reviewedBy: ObjectId | null;
  reviewedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
