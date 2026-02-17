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
  'arena',
  'pool',
  'rink',
  'park',
  'sidewalk',
  'business',
  'other',
]);

export const placeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: placeCategorySchema,
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().optional(),
  country: z.string().default('Canada'),
  description: z.string().optional(),
  location: z
    .object({
      type: z.literal('Point'),
      coordinates: z
        .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
        .describe('[lng, lat]'),
    })
    .optional(),
  // Accessibility flags
  stepFreeAccess: z.boolean().default(false),
  accessibleWashroom: z.boolean().default(false),
  accessibleParking: z.boolean().default(false),
  indoor: z.boolean().default(false),
  // Optional location for future map integration
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Review schemas
export const accessibilityAnswerSchema = z.enum(['yes', 'no', 'partial', 'unknown']);

export const reviewSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, 'Comment is required'),
  stepFreeEntrance: accessibilityAnswerSchema.optional(),
  ramp: accessibilityAnswerSchema.optional(),
  accessibleWashroom: accessibilityAnswerSchema.optional(),
  elevator: accessibilityAnswerSchema.optional(),
  accessibleParking: accessibilityAnswerSchema.optional(),
  confidence: z.number().int().min(1).max(5).optional(),
  photoUrls: z.array(z.string().url()).optional(),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PlaceInput = z.infer<typeof placeSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AccessibilityAnswer = z.infer<typeof accessibilityAnswerSchema>;
export type PlaceCategory = z.infer<typeof placeCategorySchema>;

