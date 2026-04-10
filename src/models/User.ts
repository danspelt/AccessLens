import { ObjectId } from 'mongodb';

export type UserRole = 'user' | 'admin' | 'moderator';

/** Community reviewers vs business listings accounts */
export type AccountType = 'reviewer' | 'business';

export type BusinessSubscriptionStatus = 'none' | 'pending' | 'active';

export type UserBadge =
  | 'explorer'
  | 'accessibility_hero'
  | 'city_mapper'
  | 'photo_contributor'
  | 'verified_reviewer';

export const BADGE_LABELS: Record<UserBadge, string> = {
  explorer: 'Explorer',
  accessibility_hero: 'Accessibility Hero',
  city_mapper: 'City Mapper',
  photo_contributor: 'Photo Contributor',
  verified_reviewer: 'Verified Reviewer',
};

export const BADGE_DESCRIPTIONS: Record<UserBadge, string> = {
  explorer: 'Visited 5+ places',
  accessibility_hero: 'Submitted 25+ accessibility reviews',
  city_mapper: 'Added 10+ places to the map',
  photo_contributor: 'Uploaded 20+ accessibility photos',
  verified_reviewer: 'Reviews verified by the community',
};

export interface User {
  _id: ObjectId;
  email: string;
  /** Absent for some OAuth-only rows until first password set */
  passwordHash?: string;
  name: string;
  role: UserRole;
  /** Defaults to reviewer when missing (legacy / OAuth before completion) */
  accountType?: AccountType;
  businessSubscriptionStatus?: BusinessSubscriptionStatus;
  badges: UserBadge[];
  bio?: string;
  avatarUrl?: string;
  theme?: 'system' | 'light' | 'dark';
  accentColor?: string;
  fontScale?: 'sm' | 'md' | 'lg';
  highContrast?: boolean;
  reduceMotion?: boolean;
  dyslexiaFont?: boolean;
  contentDensity?: 'comfortable' | 'compact';
  lineHeight?: 'compact' | 'normal' | 'comfortable';
  units?: 'metric' | 'imperial';
  mapAutoLoad?: boolean;
  profileVisibility?: 'public' | 'private';
  emailNotifications?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
