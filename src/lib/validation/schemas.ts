import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const placeCategorySchema = z.enum([
  'library',
  'restaurant',
  'movie_theatre',
  'park',
  'government',
  'transit',
  'sidewalk',
  'shopping',
  'hospital',
  'school',
  'sports',
  'other',
]);

export const accessibilityChecklistSchema = z.object({
  entranceRamp: z.boolean().optional(),
  automaticDoor: z.boolean().optional(),
  levelEntrance: z.boolean().optional(),
  elevator: z.boolean().optional(),
  wideAisles: z.boolean().optional(),
  accessibleSeating: z.boolean().optional(),
  accessibleWashroom: z.boolean().optional(),
  genderNeutralWashroom: z.boolean().optional(),
  accessibleParking: z.boolean().optional(),
  transitAccessible: z.boolean().optional(),
  brailleSignage: z.boolean().optional(),
  audioAnnouncements: z.boolean().optional(),
  serviceAnimalWelcome: z.boolean().optional(),
  quietSpace: z.boolean().optional(),
});

export const placeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: placeCategorySchema,
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required').default('Victoria'),
  citySlug: z.string().default('victoria-bc'),
  province: z.string().default('BC'),
  country: z.string().default('Canada'),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  checklist: accessibilityChecklistSchema.default({}),
  accessibilityNotes: z.string().max(1000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  location: z
    .object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
    })
    .optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000),
  photoUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
});

export const reportSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
  type: z.enum([
    'broken_elevator',
    'blocked_ramp',
    'construction_barrier',
    'missing_curb_cut',
    'inaccessible_washroom',
    'broken_door',
    'uneven_surface',
    'other',
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  photoUrls: z.array(z.string()).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PlaceInput = z.infer<typeof placeSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type PlaceCategory = z.infer<typeof placeCategorySchema>;
export type AccessibilityChecklistInput = z.infer<typeof accessibilityChecklistSchema>;
