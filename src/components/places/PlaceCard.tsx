import Link from 'next/link';
import { MapPin, Star, CheckCircle, XCircle } from 'lucide-react';
import { PLACE_CATEGORIES, CATEGORY_ICONS, getScoreColor, getScoreLabel } from '@/models/Place';

interface PlaceCardPlace {
  _id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  accessibilityScore?: number;
  checklist?: {
    entranceRamp?: boolean;
    accessibleWashroom?: boolean;
    accessibleParking?: boolean;
    elevator?: boolean;
  };
  photoUrls?: string[];
  avgRating?: number | null;
  reviewCount?: number;
}

interface PlaceCardProps {
  place: PlaceCardPlace;
}

export function PlaceCard({ place }: PlaceCardProps) {
  const score = place.accessibilityScore;
  const color = score !== undefined ? getScoreColor(score) : null;
  const scoreLabel = score !== undefined ? getScoreLabel(score) : null;

  const scoreColors = {
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  const categoryLabel =
    PLACE_CATEGORIES[place.category as keyof typeof PLACE_CATEGORIES] || place.category;
  const categoryIcon =
    CATEGORY_ICONS[place.category as keyof typeof CATEGORY_ICONS] || '📍';

  const thumbnail = place.photoUrls?.[0];

  return (
    <Link
      href={`/places/${place._id}`}
      className="group flex flex-col overflow-hidden panel-surface transition-[box-shadow,transform] duration-200 motion-safe:hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {/* Photo or placeholder */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 shadow-inset-well">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={`${place.name} photo`}
            className="h-full w-full object-cover transition-transform motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="orb-3d flex h-16 w-16 items-center justify-center rounded-full text-4xl" role="img" aria-label={categoryLabel}>
              {categoryIcon}
            </span>
          </div>
        )}
        {score !== undefined && color && (
          <div
            className={`absolute right-2 top-2 rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-chip-icon ${scoreColors[color]}`}
            aria-label={`Accessibility score: ${score} out of 100 — ${scoreLabel}`}
          >
            <span>{score}/100</span>
            <span className="ml-1 font-medium">{scoreLabel}</span>
          </div>
        )}
        {score === undefined && (
          <div className="absolute right-2 top-2 rounded-full border border-slate-200 bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-chip-icon">
            Score unknown
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-base" aria-hidden="true">{categoryIcon}</span>
          <span className="text-xs font-medium text-primary-600">{categoryLabel}</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary-700 line-clamp-1">
          {place.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{place.address}</span>
        </p>

        {/* Rating */}
        {place.avgRating !== null && place.avgRating !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-700">{place.avgRating}</span>
            {place.reviewCount !== undefined && (
              <span className="text-xs text-slate-500">({place.reviewCount} reviews)</span>
            )}
          </div>
        )}

        {/* Quick access badges */}
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Accessibility features">
          {[
            { key: 'entranceRamp', label: 'Ramp' },
            { key: 'accessibleWashroom', label: 'Washroom' },
            { key: 'accessibleParking', label: 'Parking' },
            { key: 'elevator', label: 'Elevator' },
          ].map(({ key, label }) => {
            const val = place.checklist?.[key as keyof typeof place.checklist];
            if (val === undefined) return null;
            return (
              <span
                key={key}
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                  val
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}
                aria-label={`${label}: ${val ? 'available' : 'not available'}`}
              >
                {val ? (
                  <CheckCircle className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <XCircle className="h-3 w-3" aria-hidden="true" />
                )}
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
