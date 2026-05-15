import { ObjectId } from 'mongodb';
import type { AccessibilityProfile } from '@/models/AccessibilityProfile';
import type { VerificationLevel } from '@/lib/accessibility/tags';

export type PlaceCategory =
  | 'library'
  | 'restaurant'
  | 'cafe'
  | 'movie_theatre'
  | 'park'
  | 'government'
  | 'transit'
  | 'sidewalk'
  | 'shopping'
  | 'hospital'
  | 'medical_office'
  | 'school'
  | 'sports'
  | 'hotel'
  | 'community_centre'
  | 'other';

export const PLACE_CATEGORIES: Record<PlaceCategory, string> = {
  library: 'Library',
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  movie_theatre: 'Movie Theatre',
  park: 'Park',
  government: 'Government Building',
  transit: 'Transit Stop',
  sidewalk: 'Sidewalk / Public Route',
  shopping: 'Retail Store',
  hospital: 'Hospital',
  medical_office: 'Medical Office',
  school: 'School',
  sports: 'Recreation Centre',
  hotel: 'Hotel',
  community_centre: 'Community Centre',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<PlaceCategory, string> = {
  library: '📚',
  restaurant: '🍽️',
  cafe: '☕',
  movie_theatre: '🎬',
  park: '🌳',
  government: '🏛️',
  transit: '🚌',
  sidewalk: '🚶',
  shopping: '🛍️',
  hospital: '🏥',
  medical_office: '🏥',
  school: '🎓',
  sports: '🏊',
  hotel: '🏨',
  community_centre: '🏘️',
  other: '📍',
};

export interface AccessibilityChecklist {
  // Entrance & Access
  entranceRamp: boolean;
  automaticDoor: boolean;
  levelEntrance: boolean;
  // Interior
  elevator: boolean;
  wideAisles: boolean;
  accessibleSeating: boolean;
  // Washrooms
  accessibleWashroom: boolean;
  genderNeutralWashroom: boolean;
  // Parking & Transit
  accessibleParking: boolean;
  transitAccessible: boolean;
  // Signage & Communication
  brailleSignage: boolean;
  audioAnnouncements: boolean;
  // Additional
  serviceAnimalWelcome: boolean;
  quietSpace: boolean;
}

export type PlaceStatus = 'active' | 'pending_review' | 'rejected' | 'archived';

/** Outreach program lifecycle for business-driven listings */
export type OutreachStatus = 'unclaimed' | 'claimed' | 'pending_review' | 'published';

export type PlaceSourceType = 'community_submission' | 'business_submission' | 'admin_created' | 'imported';

export type PartnerLabel =
  | 'accessibility_partner'
  | 'inclusive_access'
  | 'community_verified'
  | 'local_access_partner';

export interface Place {
  _id: ObjectId;
  name: string;
  slug: string;
  category: PlaceCategory;
  address: string;
  city: string;
  citySlug: string;
  province: string;
  postalCode?: string;
  country: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  // Accessibility
  checklist: Partial<AccessibilityChecklist>;
  accessibilityScore?: number; // 0-100
  accessibilityNotes?: string;
  // Photos
  photoUrls: string[];
  // Location
  latitude?: number;
  longitude?: number;
  /** GeoJSON point for geospatial queries: [lng, lat] */
  location?: { type: 'Point'; coordinates: [number, number] };
  // Status & ownership
  status: PlaceStatus;
  source?: {
    type: PlaceSourceType;
    submittedByUserId?: ObjectId;
    submittedByRole?: string;
    submissionId?: ObjectId;
  };
  claimedByUserId?: ObjectId;
  isClaimed: boolean;
  // Outreach / business portal
  accessCode?: string;
  accessCodeExpiresAt?: Date;
  outreachStatus?: OutreachStatus;
  verificationLevel?: VerificationLevel;
  partnerLabel?: PartnerLabel;
  businessContact?: {
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
  accessibilityProfile?: AccessibilityProfile;
  lastUpdatedByBusinessAt?: Date;
  // Metadata
  createdByUserId: ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const OUTREACH_STATUS_LABELS: Record<OutreachStatus, string> = {
  unclaimed: 'Unclaimed',
  claimed: 'Claimed',
  pending_review: 'Pending review',
  published: 'Published',
};

export const PARTNER_LABEL_DISPLAY: Record<PartnerLabel, string> = {
  accessibility_partner: 'AccessLens Accessibility Partner',
  inclusive_access: 'Inclusive Access Participant',
  community_verified: 'Community Accessibility Verified',
  local_access_partner: 'Local Access Partner',
};

export function calculateAccessibilityScore(checklist: Partial<AccessibilityChecklist>): number {
  const fields: (keyof AccessibilityChecklist)[] = [
    'entranceRamp',
    'automaticDoor',
    'levelEntrance',
    'elevator',
    'wideAisles',
    'accessibleWashroom',
    'accessibleParking',
    'transitAccessible',
    'brailleSignage',
    'serviceAnimalWelcome',
  ];
  const trueCount = fields.filter((f) => checklist[f] === true).length;
  return Math.round((trueCount / fields.length) * 100);
}

export function getScoreColor(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Highly Accessible';
  if (score >= 40) return 'Partially Accessible';
  return 'Accessibility Barriers';
}
