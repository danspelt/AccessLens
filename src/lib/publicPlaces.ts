import type { Filter } from 'mongodb';
import type { Place } from '@/models/Place';

// Legacy seeded listings predate status; explicit non-public statuses stay private.
export const publicPlaceFilter: Filter<Place> = {
  $or: [{ status: 'active' }, { status: { $exists: false } }],
};

export function serializePublicPlace(place: Place) {
  return {
    _id: place._id.toString(),
    name: place.name,
    slug: place.slug,
    category: place.category,
    address: place.address,
    city: place.city,
    citySlug: place.citySlug,
    province: place.province,
    postalCode: place.postalCode,
    country: place.country,
    description: place.description,
    website: place.website,
    phone: place.phone,
    checklist: place.checklist,
    accessibilityScore: place.accessibilityScore,
    accessibilityNotes: place.accessibilityNotes,
    photoUrls: place.photoUrls,
    latitude: place.latitude,
    longitude: place.longitude,
    location: place.location,
    status: place.status,
    isClaimed: place.isClaimed,
    verificationLevel: place.verificationLevel,
    partnerLabel: place.partnerLabel,
    accessibilityProfile: place.accessibilityProfile,
    source: place.source && {
      type: place.source.type,
      external: place.source.external,
    },
    verifiedAt: place.verifiedAt?.toISOString(),
    lastUpdatedByBusinessAt: place.lastUpdatedByBusinessAt?.toISOString(),
    createdAt: place.createdAt.toISOString(),
    updatedAt: place.updatedAt.toISOString(),
  };
}
