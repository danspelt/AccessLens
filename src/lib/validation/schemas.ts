import { z } from 'zod';

export const accountTypeSchema = z.enum(['reviewer', 'business']);

export const completeSignupIntentSchema = z.object({
  accountType: accountTypeSchema,
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  accountType: accountTypeSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const placeCategorySchema = z.enum([
  'library',
  'restaurant',
  'cafe',
  'movie_theatre',
  'park',
  'government',
  'transit',
  'sidewalk',
  'shopping',
  'hospital',
  'medical_office',
  'school',
  'sports',
  'hotel',
  'community_centre',
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

export const submitterRoleSchema = z.enum([
  'owner',
  'manager',
  'employee',
  'customer',
  'community_member',
  'accessibility_advocate',
  'city_staff',
  'other',
]);

export const placeSubmissionSchema = z.object({
  placeData: z.object({
    name: z.string().min(1, 'Place name is required').max(200),
    category: placeCategorySchema,
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().optional(),
    country: z.string().default('Canada'),
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
    description: z.string().max(2000).optional(),
  }),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  entrancePinned: z.boolean().optional(),
  accessibilityData: z.object({
    checklist: accessibilityChecklistSchema.default({}),
    generalNotes: z.string().max(1000).optional(),
  }),
  photoUrls: z.array(z.string()).default([]),
  submitter: z.object({
    name: z.string().min(1, 'Your name is required'),
    email: z.string().email('Valid email is required'),
    role: submitterRoleSchema,
    isOwnerOrManager: z.boolean(),
  }),
});

export const businessClaimSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  businessEmail: z.string().email().optional().or(z.literal('')),
  proofUrl: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const accessibilityUpdateSchema = z.object({
  checklist: accessibilityChecklistSchema,
  notes: z.string().max(1000).optional(),
  photoUrls: z.array(z.string()).default([]),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PlaceInput = z.infer<typeof placeSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type PlaceCategory = z.infer<typeof placeCategorySchema>;
export type AccessibilityChecklistInput = z.infer<typeof accessibilityChecklistSchema>;
export type PlaceSubmissionInput = z.infer<typeof placeSubmissionSchema>;
export type BusinessClaimInput = z.infer<typeof businessClaimSchema>;
export type AccessibilityUpdateInput = z.infer<typeof accessibilityUpdateSchema>;
