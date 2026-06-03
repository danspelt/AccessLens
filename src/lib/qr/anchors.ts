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
  // ── Core downtown ────────────────────────────────────────────────────────
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
    title: 'Empress & Fairmont Block',
    subtitle: 'Across from the Inner Harbour',
    latitude: 48.4215,
    longitude: -123.3674,
    radiusKm: 0.5,
    citySlug: 'victoria-bc',
  },
  'old-town': {
    slug: 'old-town',
    title: 'Old Town & Fan Tan Alley',
    subtitle: 'Historic core, Chinatown, and Bastion Square',
    latitude: 48.4268,
    longitude: -123.3692,
    radiusKm: 0.6,
    citySlug: 'victoria-bc',
  },
  'johnson-street-bridge': {
    slug: 'johnson-street-bridge',
    title: 'Johnson Street Bridge area',
    subtitle: 'Connecting downtown to the harbour trails',
    latitude: 48.4295,
    longitude: -123.3720,
    radiusKm: 0.6,
    citySlug: 'victoria-bc',
  },

  // ── Cook Street Village & surrounding ───────────────────────────────────
  'cook-street-village': {
    slug: 'cook-street-village',
    title: 'Cook Street Village',
    subtitle: 'Cafes, shops, and Beacon Hill Park nearby',
    latitude: 48.4162,
    longitude: -123.3589,
    radiusKm: 0.6,
    citySlug: 'victoria-bc',
  },
  'beacon-hill-park': {
    slug: 'beacon-hill-park',
    title: 'Beacon Hill Park',
    subtitle: 'Park entrances & Douglas Street border',
    latitude: 48.4123,
    longitude: -123.3600,
    radiusKm: 0.8,
    citySlug: 'victoria-bc',
  },

  // ── Fernwood & North Park ────────────────────────────────────────────────
  'fernwood': {
    slug: 'fernwood',
    title: 'Fernwood Village',
    subtitle: 'Balmoral Road shops & community spaces',
    latitude: 48.4371,
    longitude: -123.3540,
    radiusKm: 0.7,
    citySlug: 'victoria-bc',
  },
  'north-park': {
    slug: 'north-park',
    title: 'North Park',
    subtitle: 'Herald Street & Fisgard corridor',
    latitude: 48.4328,
    longitude: -123.3615,
    radiusKm: 0.65,
    citySlug: 'victoria-bc',
  },

  // ── James Bay ───────────────────────────────────────────────────────────
  'james-bay': {
    slug: 'james-bay',
    title: 'James Bay',
    subtitle: 'Menzies Street, Thrifty Foods area & waterfront',
    latitude: 48.4148,
    longitude: -123.3730,
    radiusKm: 0.75,
    citySlug: 'victoria-bc',
  },

  // ── Quadra–Hillside & Burnside ───────────────────────────────────────────
  'quadra-hillside': {
    slug: 'quadra-hillside',
    title: 'Quadra–Hillside',
    subtitle: 'Hillside Ave & Quadra Street shops',
    latitude: 48.4440,
    longitude: -123.3540,
    radiusKm: 0.8,
    citySlug: 'victoria-bc',
  },
  'burnside': {
    slug: 'burnside',
    title: 'Burnside–Gorge',
    subtitle: 'Burnside Road & Rock Bay district',
    latitude: 48.4460,
    longitude: -123.3780,
    radiusKm: 0.85,
    citySlug: 'victoria-bc',
  },

  // ── Saanich & Uptown area ────────────────────────────────────────────────
  'uptown': {
    slug: 'uptown',
    title: 'Uptown Shopping District',
    subtitle: 'Uptown Centre & Douglas Street North',
    latitude: 48.4605,
    longitude: -123.3738,
    radiusKm: 0.9,
    citySlug: 'victoria-bc',
  },
  'mayfair': {
    slug: 'mayfair',
    title: 'Mayfair Shopping Centre area',
    subtitle: 'Blanshard Street & Tolmie Ave',
    latitude: 48.4522,
    longitude: -123.3648,
    radiusKm: 0.75,
    citySlug: 'victoria-bc',
  },
  'tillicum': {
    slug: 'tillicum',
    title: 'Tillicum Road Corridor',
    subtitle: 'Tillicum Mall & surrounding services',
    latitude: 48.4520,
    longitude: -123.3950,
    radiusKm: 0.8,
    citySlug: 'victoria-bc',
  },

  // ── Oak Bay & Fairfield ──────────────────────────────────────────────────
  'oak-bay-village': {
    slug: 'oak-bay-village',
    title: 'Oak Bay Village',
    subtitle: 'Oak Bay Ave shops & cafes',
    latitude: 48.4260,
    longitude: -123.3200,
    radiusKm: 0.65,
    citySlug: 'victoria-bc',
  },
  'fairfield': {
    slug: 'fairfield',
    title: 'Fairfield',
    subtitle: 'Fort Street "antique row" & Dallas Road',
    latitude: 48.4185,
    longitude: -123.3470,
    radiusKm: 0.75,
    citySlug: 'victoria-bc',
  },

  // ── Esquimalt ───────────────────────────────────────────────────────────
  'esquimalt-town-centre': {
    slug: 'esquimalt-town-centre',
    title: 'Esquimalt Town Centre',
    subtitle: 'Esquimalt Road village core',
    latitude: 48.4320,
    longitude: -123.4140,
    radiusKm: 0.75,
    citySlug: 'victoria-bc',
  },

  // ── Royal Jubilee & Fort Street ──────────────────────────────────────────
  'fort-street': {
    slug: 'fort-street',
    title: 'Fort Street (Antique Row)',
    subtitle: 'Fort St between Cook and Foul Bay',
    latitude: 48.4235,
    longitude: -123.3420,
    radiusKm: 0.7,
    citySlug: 'victoria-bc',
  },
  'royal-jubilee': {
    slug: 'royal-jubilee',
    title: 'Royal Jubilee Hospital area',
    subtitle: 'Richmond Ave & hospital district services',
    latitude: 48.4340,
    longitude: -123.3320,
    radiusKm: 0.7,
    citySlug: 'victoria-bc',
  },

  // ── Victoria General / Langford border ──────────────────────────────────
  'victoria-general': {
    slug: 'victoria-general',
    title: 'Victoria General Hospital area',
    subtitle: 'Helmcken Road & West Shore medical district',
    latitude: 48.4440,
    longitude: -123.4650,
    radiusKm: 0.85,
    citySlug: 'victoria-bc',
  },
};

export function getQrAnchor(slug: string): QrAnchor | undefined {
  return QR_ANCHORS[slug];
}

export function listQrAnchors(): QrAnchor[] {
  return Object.values(QR_ANCHORS).sort((a, b) => a.title.localeCompare(b.title));
}
