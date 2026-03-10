import { z } from 'zod';

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Place schemas
export const placeCategorySchema = z.enum([
  'libraries',
  'restaurants',
  'movie-theatres',
  'parks',
  'public-buildings',
  'transit-stops',
  'sidewalks',
  'crosswalks',
  'hospitals',
  'schools',
  'shopping-centres',
  'government-buildings',
]);

export const photoReferenceSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.startsWith('/uploads/') || /^https?:\/\//.test(value),
    'Photo URLs must be local uploads or absolute URLs'
  );

export const accessibilityChecklistSchema = z.object({
  ramp: z.boolean().default(false),
  automaticDoor: z.boolean().default(false),
  elevator: z.boolean().default(false),
  accessibleWashroom: z.boolean().default(false),
  accessibleParking: z.boolean().default(false),
  wideAisles: z.boolean().default(false),
  smoothPath: z.boolean().default(false),
});

export const placeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: placeCategorySchema,
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().default('BC'),
  country: z.string().default('Canada'),
  description: z.string().max(1800).optional(),
  accessibilityChecklist: accessibilityChecklistSchema,
  accessibilityNotes: z.string().max(1500).optional(),
  photoUrls: z.array(photoReferenceSchema).max(10).default([]),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Review schemas
export const reviewSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
  rating: z.number().int().min(1).max(5),
  headline: z.string().max(120).optional(),
  comment: z.string().min(1, 'Comment is required'),
  accessibilityNotes: z.string().max(800).optional(),
  photoUrls: z.array(photoReferenceSchema).max(8).optional(),
});

export const placePhotoSchema = z.object({
  photoUrls: z.array(photoReferenceSchema).min(1).max(10),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PlaceInput = z.infer<typeof placeSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type PlaceCategory = z.infer<typeof placeCategorySchema>;

