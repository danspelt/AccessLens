import Link from 'next/link';
import { Place } from '@/models/Place';

interface PlaceCardProps {
  place: Place;
  avgRating?: number;
  reviewCount?: number;
}

export function PlaceCard({ place, avgRating, reviewCount }: PlaceCardProps) {
  const categoryLabels: Record<Place['category'], string> = {
    arena: 'Arena',
    pool: 'Pool',
    rink: 'Rink',
    park: 'Park',
    sidewalk: 'Sidewalk',
    business: 'Business',
    other: 'Other',
  };

  return (
    <Link
      href={`/places/${place._id.toString()}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {categoryLabels[place.category]} • {place.city}
            {place.province && `, ${place.province}`}
          </p>
          <p className="mt-2 text-sm text-gray-700">{place.address}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {place.stepFreeAccess && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Step-free access
              </span>
            )}
            {place.accessibleWashroom && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Accessible washroom
              </span>
            )}
            {place.accessibleParking && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Accessible parking
              </span>
            )}
            {place.indoor && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                Indoor
              </span>
            )}
          </div>
        </div>
        {avgRating !== undefined && (
          <div className="ml-4 text-right">
            <div className="text-2xl font-bold text-gray-900">
              {avgRating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">
              {reviewCount || 0} {reviewCount === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

