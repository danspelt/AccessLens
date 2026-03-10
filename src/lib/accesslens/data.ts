import { ObjectId } from 'mongodb';
import {
  calculateAccessibilityScore,
  createCitySlug,
  createPlaceSlug,
  getAccessibilityStatus,
  getCityDefinition,
  PLACE_CATEGORIES,
} from '@/lib/accesslens/constants';
import { SEEDED_PLACES, SEEDED_REVIEWS } from '@/lib/accesslens/seed';
import { getCollection } from '@/lib/db/mongoClient';
import { AccessibilityChecklist, Place, PlaceCategory } from '@/models/Place';
import { Review } from '@/models/Review';
import { User } from '@/models/User';

export interface PlaceFilters {
  citySlug?: string;
  category?: PlaceCategory;
  search?: string;
  ramp?: boolean;
  automaticDoor?: boolean;
  elevator?: boolean;
  accessibleWashroom?: boolean;
  accessibleParking?: boolean;
  wideAisles?: boolean;
  smoothPath?: boolean;
}

export interface ReviewWithAuthor extends Review {
  userName: string;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_DB);
}

function normalizeChecklist(input: Partial<AccessibilityChecklist> & Record<string, unknown>): AccessibilityChecklist {
  return {
    ramp: Boolean(input.ramp ?? input.stepFreeAccess ?? false),
    automaticDoor: Boolean(input.automaticDoor ?? false),
    elevator: Boolean(input.elevator ?? false),
    accessibleWashroom: Boolean(input.accessibleWashroom ?? false),
    accessibleParking: Boolean(input.accessibleParking ?? false),
    wideAisles: Boolean(input.wideAisles ?? false),
    smoothPath: Boolean(input.smoothPath ?? false),
  };
}

function normalizeCategory(input: unknown): PlaceCategory {
  if (typeof input === 'string' && PLACE_CATEGORIES.includes(input as PlaceCategory)) {
    return input as PlaceCategory;
  }

  return 'public-buildings';
}

function normalizePlace(input: Partial<Place> & Record<string, unknown>) {
  const rawChecklist =
    input.accessibilityChecklist && typeof input.accessibilityChecklist === 'object'
      ? (input.accessibilityChecklist as unknown as Record<string, unknown>)
      : input;
  const checklist = normalizeChecklist(rawChecklist);
  const category = normalizeCategory(input.category);
  const slug = typeof input.slug === 'string' ? input.slug : createPlaceSlug(String(input.name ?? 'place'));
  const city = typeof input.city === 'string' ? input.city : 'Victoria';
  const province = typeof input.province === 'string' ? input.province : 'BC';
  const citySlug =
    typeof input.citySlug === 'string' ? input.citySlug : createCitySlug(city, province);
  const accessibilityScore =
    typeof input.accessibilityScore === 'number'
      ? input.accessibilityScore
      : calculateAccessibilityScore(checklist);
  const accessibilityStatus =
    input.accessibilityStatus === 'accessible' ||
    input.accessibilityStatus === 'partial' ||
    input.accessibilityStatus === 'limited'
      ? input.accessibilityStatus
      : getAccessibilityStatus(accessibilityScore);

  return {
    _id: input._id instanceof ObjectId ? input._id : new ObjectId(),
    slug,
    name: String(input.name ?? 'Unnamed place'),
    category,
    address: String(input.address ?? ''),
    city,
    citySlug,
    province,
    country: typeof input.country === 'string' ? input.country : 'Canada',
    description: typeof input.description === 'string' ? input.description : undefined,
    accessibilityChecklist: checklist,
    accessibilityNotes:
      typeof input.accessibilityNotes === 'string' ? input.accessibilityNotes : undefined,
    accessibilityScore,
    accessibilityStatus,
    photoUrls: Array.isArray(input.photoUrls)
      ? input.photoUrls.filter((url): url is string => typeof url === 'string')
      : [],
    latitude: typeof input.latitude === 'number' ? input.latitude : undefined,
    longitude: typeof input.longitude === 'number' ? input.longitude : undefined,
    createdByUserId:
      input.createdByUserId instanceof ObjectId ? input.createdByUserId : new ObjectId(),
    createdAt: input.createdAt instanceof Date ? input.createdAt : new Date(),
    updatedAt: input.updatedAt instanceof Date ? input.updatedAt : new Date(),
  } satisfies Place;
}

function applyFilters(places: Place[], filters: PlaceFilters) {
  return places.filter((place) => {
    if (filters.citySlug && place.citySlug !== filters.citySlug) {
      return false;
    }

    if (filters.category && place.category !== filters.category) {
      return false;
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const haystack = `${place.name} ${place.address} ${place.city} ${place.description ?? ''}`.toLowerCase();
      if (!haystack.includes(searchTerm)) {
        return false;
      }
    }

    const checklistEntries: Array<keyof AccessibilityChecklist> = [
      'ramp',
      'automaticDoor',
      'elevator',
      'accessibleWashroom',
      'accessibleParking',
      'wideAisles',
      'smoothPath',
    ];

    return checklistEntries.every((field) => {
      const value = filters[field];
      if (!value) {
        return true;
      }

      return place.accessibilityChecklist[field];
    });
  });
}

export async function listPlaces(filters: PlaceFilters = {}) {
  if (!isDatabaseConfigured()) {
    return applyFilters(SEEDED_PLACES, filters).sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
    );
  }

  const placesCollection = await getCollection<Place>('places');
  const query: Record<string, unknown> = {};

  if (filters.citySlug) {
    query.citySlug = filters.citySlug;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { address: { $regex: filters.search, $options: 'i' } },
      { city: { $regex: filters.search, $options: 'i' } },
    ];
  }

  (
    [
      'ramp',
      'automaticDoor',
      'elevator',
      'accessibleWashroom',
      'accessibleParking',
      'wideAisles',
      'smoothPath',
    ] as Array<keyof AccessibilityChecklist>
  ).forEach((field) => {
    if (filters[field]) {
      query[`accessibilityChecklist.${field}`] = true;
    }
  });

  const documents = await placesCollection.find(query).sort({ createdAt: -1 }).limit(200).toArray();
  return documents.map((document) => normalizePlace(document));
}

export async function getFeaturedPlaces(citySlug = 'victoria-bc', limit = 6) {
  const places = await listPlaces({ citySlug });
  return [...places]
    .sort((left, right) => right.accessibilityScore - left.accessibilityScore)
    .slice(0, limit);
}

export async function getPlaceById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  if (!isDatabaseConfigured()) {
    return SEEDED_PLACES.find((place) => place._id.toString() === id) ?? null;
  }

  const placesCollection = await getCollection<Place>('places');
  const place = await placesCollection.findOne({ _id: new ObjectId(id) });
  return place ? normalizePlace(place) : null;
}

export async function getPlaceBySlugs(citySlug: string, category: string, placeSlug: string) {
  if (!PLACE_CATEGORIES.includes(category as PlaceCategory)) {
    return null;
  }

  const normalizedCategory = category as PlaceCategory;

  if (!isDatabaseConfigured()) {
    return (
      SEEDED_PLACES.find(
        (place) =>
          place.citySlug === citySlug &&
          place.category === normalizedCategory &&
          place.slug === placeSlug
      ) ?? null
    );
  }

  const placesCollection = await getCollection<Place>('places');
  const place = await placesCollection.findOne({
    citySlug,
    category: normalizedCategory,
    slug: placeSlug,
  });

  return place ? normalizePlace(place) : null;
}

export async function getReviewsForPlace(placeId: ObjectId) {
  if (!isDatabaseConfigured()) {
    return SEEDED_REVIEWS.filter((review) => review.placeId.equals(placeId)).sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
    );
  }

  const reviewsCollection = await getCollection<Review>('reviews');
  const usersCollection = await getCollection<User>('users');
  const reviews = await reviewsCollection
    .find({ placeId })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const userIds = [...new Set(reviews.map((review) => review.userId.toString()))];
  const users =
    userIds.length > 0
      ? await usersCollection
          .find({ _id: { $in: userIds.map((userId) => new ObjectId(userId)) } })
          .project({ _id: 1, name: 1 })
          .toArray()
      : [];
  const userMap = new Map(users.map((user) => [user._id.toString(), user.name]));

  return reviews.map((review) => ({
    ...review,
    userName: userMap.get(review.userId.toString()) ?? 'Community member',
  })) satisfies ReviewWithAuthor[];
}

export async function getUserPlaces(userId: ObjectId) {
  if (!isDatabaseConfigured()) {
    return SEEDED_PLACES.filter((place) => place.createdByUserId.equals(userId));
  }

  const placesCollection = await getCollection<Place>('places');
  const places = await placesCollection.find({ createdByUserId: userId }).sort({ createdAt: -1 }).toArray();
  return places.map((place) => normalizePlace(place));
}

export async function getUserReviews(userId: ObjectId) {
  if (!isDatabaseConfigured()) {
    return SEEDED_REVIEWS.filter((review) => review.userId.equals(userId)).map((review) => {
      const place = SEEDED_PLACES.find((candidate) => candidate._id.equals(review.placeId));
      return {
        ...review,
        placeName: place?.name ?? 'Unknown place',
        placePath: place
          ? `/${place.citySlug}/${place.category}/${place.slug}`
          : '#',
      };
    });
  }

  const reviewsCollection = await getCollection<Review>('reviews');
  const placesCollection = await getCollection<Place>('places');
  const reviews = await reviewsCollection.find({ userId }).sort({ createdAt: -1 }).limit(50).toArray();
  const placeIds = [...new Set(reviews.map((review) => review.placeId.toString()))];
  const places =
    placeIds.length > 0
      ? await placesCollection.find({ _id: { $in: placeIds.map((id) => new ObjectId(id)) } }).toArray()
      : [];
  const placeMap = new Map(places.map((place) => [place._id.toString(), normalizePlace(place)]));

  return reviews.map((review) => {
    const place = placeMap.get(review.placeId.toString());
    return {
      ...review,
      placeName: place?.name ?? 'Unknown place',
      placePath: place ? `/${place.citySlug}/${place.category}/${place.slug}` : '#',
    };
  });
}

export async function getCategoryBreakdown(citySlug: string) {
  const places = await listPlaces({ citySlug });

  return PLACE_CATEGORIES.map((category) => ({
    category,
    count: places.filter((place) => place.category === category).length,
  })).filter((entry) => entry.count > 0);
}

export async function getCityPageData(citySlug: string) {
  const city = getCityDefinition(citySlug);
  if (!city) {
    return null;
  }

  const [places, featuredPlaces, categoryBreakdown] = await Promise.all([
    listPlaces({ citySlug }),
    getFeaturedPlaces(citySlug),
    getCategoryBreakdown(citySlug),
  ]);

  const averageAccessibilityScore =
    places.length > 0
      ? Number(
          (
            places.reduce((sum, place) => sum + place.accessibilityScore, 0) /
            places.length
          ).toFixed(2)
        )
      : 0;

  return {
    city,
    places,
    featuredPlaces,
    categoryBreakdown,
    averageAccessibilityScore,
  };
}

export function serializePlace(place: Place) {
  return {
    id: place._id.toString(),
    slug: place.slug,
    name: place.name,
    category: place.category,
    address: place.address,
    city: place.city,
    citySlug: place.citySlug,
    province: place.province,
    country: place.country,
    description: place.description,
    accessibilityChecklist: place.accessibilityChecklist,
    accessibilityNotes: place.accessibilityNotes,
    accessibilityScore: place.accessibilityScore,
    accessibilityStatus: place.accessibilityStatus,
    photoUrls: place.photoUrls ?? [],
    latitude: place.latitude,
    longitude: place.longitude,
    createdAt: place.createdAt.toISOString(),
    updatedAt: place.updatedAt.toISOString(),
  };
}

export function serializeReview(review: ReviewWithAuthor) {
  return {
    id: review._id.toString(),
    placeId: review.placeId.toString(),
    userId: review.userId.toString(),
    userName: review.userName,
    rating: review.rating,
    headline: review.headline,
    comment: review.comment,
    accessibilityNotes: review.accessibilityNotes,
    photoUrls: review.photoUrls ?? [],
    createdAt: review.createdAt.toISOString(),
  };
}
