import Link from 'next/link';
import {
  ACCESSIBILITY_STATUS_META,
  formatAccessibilityPercentage,
  getPlacePath,
  PLACE_CATEGORY_META,
} from '@/lib/accesslens/constants';
import { Place } from '@/models/Place';

interface PlaceCardProps {
  place: Place;
  avgRating?: number;
  reviewCount?: number;
}

export function PlaceCard({ place, avgRating, reviewCount }: PlaceCardProps) {
  const statusMeta = ACCESSIBILITY_STATUS_META[place.accessibilityStatus];
  const activeFeatures = Object.entries(place.accessibilityChecklist)
    .filter(([, isEnabled]) => isEnabled)
    .slice(0, 3);

  return (
    <Link
      href={getPlacePath(place)}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.badgeClassName}`}
            >
              {statusMeta.label}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {PLACE_CATEGORY_META[place.category].label}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-gray-900">{place.name}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {place.city}, {place.province}
          </p>
          <p className="mt-2 text-sm text-gray-700">{place.address}</p>
          {place.description ? (
            <p className="mt-3 text-sm text-gray-600 line-clamp-3">{place.description}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {activeFeatures.map(([feature]) => (
              <span
                key={feature}
                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
              >
                {feature === 'ramp'
                  ? 'Step-free access'
                  : feature === 'automaticDoor'
                    ? 'Automatic door'
                    : feature === 'elevator'
                      ? 'Elevator'
                      : feature === 'accessibleWashroom'
                        ? 'Accessible washroom'
                        : feature === 'accessibleParking'
                          ? 'Accessible parking'
                          : feature === 'wideAisles'
                            ? 'Wide aisles'
                            : 'Smooth path'}
              </span>
            ))}
          </div>
        </div>

        <div className="ml-4 min-w-[110px] text-right">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Access score
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatAccessibilityPercentage(place.accessibilityScore)}
          </div>
          {avgRating !== undefined ? (
            <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
              <div className="text-sm font-semibold text-gray-900">{avgRating.toFixed(1)} / 5</div>
              <div className="text-xs text-gray-500">
                {reviewCount || 0} {reviewCount === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-gray-500">No reviews yet</div>
          )}
        </div>
      </div>
    </Link>
  );
}

