/**
 * On-the-ground QR entry points: each slug maps to a geographic anchor.
 * Phase 2: can move to MongoDB when teams manage codes without deploys.
 */
export interface QrAnchor {
  slug: string;
  /** Shown as the main “you’re here” headline */
  title: string;
  /** Optional context under the title */
  subtitle?: string;
  latitude: number;
  longitude: number;
  /** Search radius for nearby places */
  radiusKm: number;
  /** Limits results to this city (matches Place.citySlug) */
  citySlug: string;
}

export const QR_ANCHORS: Record<string, QrAnchor> = {
  'downtown-victoria': {
    slug: 'downtown-victoria',
    title: 'Downtown Victoria',
    subtitle: 'Near Government Street & the Douglas corridor',
    latitude: 48.4284,
    longitude: -123.3656,
    radiusKm: 0.85,
    citySlug: 'victoria-bc',
  },
  'inner-harbour': {
    slug: 'inner-harbour',
    title: 'Inner Harbour',
    subtitle: 'Waterfront, legislature, and visitor district',
    latitude: 48.4219,
    longitude: -123.3682,
    radiusKm: 0.75,
    citySlug: 'victoria-bc',
  },
  'empress-hotel-area': {
    slug: 'empress-hotel-area',
    title: 'Empress & Fairmont block',
    subtitle: 'Across from the Inner Harbour',
    latitude: 48.4215,
    longitude: -123.3674,
    radiusKm: 0.5,
    citySlug: 'victoria-bc',
  },
};

export function getQrAnchor(slug: string): QrAnchor | undefined {
  return QR_ANCHORS[slug];
}

export function listQrAnchors(): QrAnchor[] {
  return Object.values(QR_ANCHORS).sort((a, b) => a.title.localeCompare(b.title));
}
