import { ObjectId } from 'mongodb';

export type PlaceCategory =
  | 'libraries'
  | 'restaurants'
  | 'movie-theatres'
  | 'parks'
  | 'public-buildings'
  | 'transit-stops'
  | 'sidewalks'
  | 'crosswalks'
  | 'hospitals'
  | 'schools'
  | 'shopping-centres'
  | 'government-buildings';

export interface AccessibilityChecklist {
  ramp: boolean;
  automaticDoor: boolean;
  elevator: boolean;
  accessibleWashroom: boolean;
  accessibleParking: boolean;
  wideAisles: boolean;
  smoothPath: boolean;
}

export type AccessibilityStatus = 'accessible' | 'partial' | 'limited';

export interface Place {
  _id: ObjectId;
  slug: string;
  name: string;
  category: PlaceCategory;
  address: string;
  city: string;
  citySlug: string;
  province: string;
  country: string;
  description?: string;
  accessibilityChecklist: AccessibilityChecklist;
  accessibilityNotes?: string;
  accessibilityScore: number;
  accessibilityStatus: AccessibilityStatus;
  photoUrls?: string[];
  latitude?: number;
  longitude?: number;
  createdByUserId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

