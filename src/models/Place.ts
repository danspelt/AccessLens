import { ObjectId } from 'mongodb';

export type PlaceCategory =
  | 'library'
  | 'restaurant'
  | 'movie_theatre'
  | 'park'
  | 'government'
  | 'transit'
  | 'sidewalk'
  | 'shopping'
  | 'hospital'
  | 'school'
  | 'sports'
  | 'other';

export const PLACE_CATEGORIES: Record<PlaceCategory, string> = {
  library: 'Library',
  restaurant: 'Restaurant',
  movie_theatre: 'Movie Theatre',
  park: 'Park',
  government: 'Government Building',
  transit: 'Transit Stop',
  sidewalk: 'Sidewalk',
  shopping: 'Shopping',
  hospital: 'Hospital',
  school: 'School',
  sports: 'Sports & Recreation',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<PlaceCategory, string> = {
  library: '📚',
  restaurant: '🍽️',
  movie_theatre: '🎬',
  park: '🌳',
  government: '🏛️',
  transit: '🚌',
  sidewalk: '🚶',
  shopping: '🛍️',
  hospital: '🏥',
  school: '🎓',
  sports: '🏊',
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

export interface Place {
  _id: ObjectId;
  name: string;
  slug: string;
  category: PlaceCategory;
  address: string;
  city: string;
  citySlug: string;
  province: string;
  country: string;
  description?: string;
  website?: string;
  phone?: string;
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
  // Metadata
  createdByUserId: ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
