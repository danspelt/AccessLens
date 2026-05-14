import { ObjectId } from 'mongodb';
import type { PlaceCategory } from './Place';

export type PlaceSubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'duplicate'
  | 'needs_more_info';

export type SubmitterRole =
  | 'owner'
  | 'manager'
  | 'employee'
  | 'customer'
  | 'community_member'
  | 'accessibility_advocate'
  | 'city_staff'
  | 'other';

export const SUBMITTER_ROLES: Record<SubmitterRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  employee: 'Employee',
  customer: 'Customer',
  community_member: 'Community Member',
  accessibility_advocate: 'Accessibility Advocate',
  city_staff: 'City Staff',
  other: 'Other',
};

export const SUBMISSION_STATUS_LABELS: Record<PlaceSubmissionStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  duplicate: 'Duplicate',
  needs_more_info: 'Needs More Info',
};

export interface PlaceSubmission {
  _id: ObjectId;

  placeData: {
    name: string;
    category: PlaceCategory;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
    phone?: string;
    website?: string;
    email?: string;
    description?: string;
  };

  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  latitude?: number;
  longitude?: number;
  entrancePinned?: boolean;

  accessibilityData: {
    checklist: Record<string, boolean>;
    generalNotes?: string;
  };

  photoUrls: string[];

  submittedBy: {
    userId: ObjectId;
    name: string;
    email: string;
    role: SubmitterRole;
    isOwnerOrManager: boolean;
  };

  status: PlaceSubmissionStatus;

  adminReview: {
    reviewedBy: ObjectId | null;
    reviewedAt: Date | null;
    notes: string;
  };

  createdPlaceId?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
