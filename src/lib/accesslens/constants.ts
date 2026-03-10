import slugify from 'slugify';
import { AccessibilityChecklist, AccessibilityStatus, Place, PlaceCategory } from '@/models/Place';

export const ACCESSIBILITY_CHECKLIST_FIELDS: Array<keyof AccessibilityChecklist> = [
  'ramp',
  'automaticDoor',
  'elevator',
  'accessibleWashroom',
  'accessibleParking',
  'wideAisles',
  'smoothPath',
];

export const ACCESSIBILITY_CHECKLIST_LABELS: Record<keyof AccessibilityChecklist, string> = {
  ramp: 'Ramp or step-free entrance',
  automaticDoor: 'Automatic door',
  elevator: 'Elevator or lift access',
  accessibleWashroom: 'Accessible washroom',
  accessibleParking: 'Accessible parking',
  wideAisles: 'Wide aisles or circulation space',
  smoothPath: 'Smooth sidewalk or path of travel',
};

export const ACCESSIBILITY_STATUS_META: Record<
  AccessibilityStatus,
  { label: string; badgeClassName: string; description: string }
> = {
  accessible: {
    label: 'Accessible',
    badgeClassName: 'bg-emerald-100 text-emerald-800',
    description: 'Most key accessibility features are present.',
  },
  partial: {
    label: 'Partially accessible',
    badgeClassName: 'bg-amber-100 text-amber-800',
    description: 'Some important accessibility features are present.',
  },
  limited: {
    label: 'Accessibility barriers reported',
    badgeClassName: 'bg-rose-100 text-rose-800',
    description: 'This place currently has significant accessibility barriers.',
  },
};

export const PLACE_CATEGORY_META: Record<
  PlaceCategory,
  { label: string; shortLabel: string; description: string }
> = {
  libraries: {
    label: 'Libraries',
    shortLabel: 'Libraries',
    description: 'Public and academic libraries with entrances, aisles, and washroom details.',
  },
  restaurants: {
    label: 'Restaurants',
    shortLabel: 'Restaurants',
    description: 'Dining spaces with crowding, seating, washroom, and entry details.',
  },
  'movie-theatres': {
    label: 'Movie Theatres',
    shortLabel: 'Theatres',
    description: 'Cinemas with accessible seating, washrooms, and entrance access.',
  },
  parks: {
    label: 'Parks',
    shortLabel: 'Parks',
    description: 'Outdoor public spaces with paths, surfaces, and washroom access.',
  },
  'public-buildings': {
    label: 'Public Buildings',
    shortLabel: 'Buildings',
    description: 'Civic facilities, museums, and community buildings.',
  },
  'transit-stops': {
    label: 'Transit Stops',
    shortLabel: 'Transit',
    description: 'Bus stops and exchanges with curb, shelter, and boarding access.',
  },
  sidewalks: {
    label: 'Sidewalks',
    shortLabel: 'Sidewalks',
    description: 'Sidewalk segments with width, slope, and surface details.',
  },
  crosswalks: {
    label: 'Crosswalks',
    shortLabel: 'Crosswalks',
    description: 'Crossings with curb cuts, timing, and tactile indicators.',
  },
  hospitals: {
    label: 'Hospitals',
    shortLabel: 'Hospitals',
    description: 'Healthcare facilities with entrances, parking, and internal access.',
  },
  schools: {
    label: 'Schools',
    shortLabel: 'Schools',
    description: 'Schools and campuses with path, elevator, and washroom information.',
  },
  'shopping-centres': {
    label: 'Shopping Centres',
    shortLabel: 'Shopping',
    description: 'Malls and retail centres with entrances, elevators, and rest areas.',
  },
  'government-buildings': {
    label: 'Government Buildings',
    shortLabel: 'Government',
    description: 'Government offices and legislative spaces used by the public.',
  },
};

export const PLACE_CATEGORIES = Object.keys(PLACE_CATEGORY_META) as PlaceCategory[];

export interface CityDefinition {
  slug: string;
  name: string;
  province: string;
  country: string;
  hero: string;
  launchNotes: string;
}

export const CITY_DEFINITIONS: CityDefinition[] = [
  {
    slug: 'victoria-bc',
    name: 'Victoria',
    province: 'BC',
    country: 'Canada',
    hero: 'Starting with a focused launch in Victoria, BC to build the city accessibility knowledge base.',
    launchNotes:
      'Victoria is the AccessLens launch city, with public spaces, libraries, parks, sidewalks, and civic buildings ready for community documentation.',
  },
];

export const CITY_LOOKUP = new Map(CITY_DEFINITIONS.map((city) => [city.slug, city]));

export function getCityDefinition(citySlug: string) {
  return CITY_LOOKUP.get(citySlug);
}

export function createCitySlug(city: string, province?: string) {
  return slugify([city, province].filter(Boolean).join(' '), { lower: true, strict: true });
}

export function createPlaceSlug(name: string) {
  return slugify(name, { lower: true, strict: true });
}

export function calculateAccessibilityScore(checklist: AccessibilityChecklist) {
  const completedChecks = ACCESSIBILITY_CHECKLIST_FIELDS.filter((field) => checklist[field]).length;
  return Number((completedChecks / ACCESSIBILITY_CHECKLIST_FIELDS.length).toFixed(2));
}

export function getAccessibilityStatus(score: number): AccessibilityStatus {
  if (score >= 0.72) {
    return 'accessible';
  }

  if (score >= 0.4) {
    return 'partial';
  }

  return 'limited';
}

export function formatAccessibilityPercentage(score: number) {
  return `${Math.round(score * 100)}%`;
}

export function getPlacePath(place: Pick<Place, 'citySlug' | 'category' | 'slug'>) {
  return `/${place.citySlug}/${place.category}/${place.slug}`;
}
