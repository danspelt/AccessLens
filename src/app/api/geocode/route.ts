import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCachedGeocode, setCachedGeocode } from '@/lib/db/geocode';

// Simple per-instance limiter (best-effort). Cache does the heavy lifting.
const lastByIp = new Map<string, number>();
const MIN_INTERVAL_MS = 1100; // ~1 req/sec

const forwardLimitSchema = z.coerce.number().int().min(1).max(3);

const reverseSchema = z.object({
  lat: z.coerce.number().finite().gte(-90).lte(90),
  lon: z.coerce.number().finite().gte(-180).lte(180),
});

function reverseCacheKey(lat: number, lon: number): string {
  return `reverse:${lat.toFixed(5)},${lon.toFixed(5)}`;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function userAgent(): string {
  return (
    process.env.NOMINATIM_USER_AGENT ||
    'AccessLens (contact: admin@example.com)'
  );
}

type NominatimSearchHit = {
  lat: string;
  lon: string;
  display_name: string;
  place_id?: number;
  osm_type?: string;
  category?: string;
  type?: string;
};

type NominatimReverseHit = {
  lat: string;
  lon: string;
  display_name: string;
  place_id?: number;
  osm_type?: string;
  category?: string;
  type?: string;
  address?: Record<string, string>;
};

type PhotonFeature = {
  geometry?: { coordinates?: number[] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    district?: string;
    state?: string;
    postcode?: string;
    country?: string;
    osm_type?: string;
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
  };
};

function photonDisplayName(p: PhotonFeature['properties']): string {
  const streetPart = [p?.housenumber, p?.street].filter(Boolean).join(' ');
  return [p?.name, streetPart, p?.city, p?.state, p?.country]
    .filter(Boolean)
    .join(', ');
}

async function photonFetch(url: URL): Promise<PhotonFeature[]> {
  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': userAgent(),
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('photon_http');
  const data: unknown = await res.json();
  const features = (data as { features?: unknown })?.features;
  return Array.isArray(features) ? (features as PhotonFeature[]) : [];
}

async function photonForwardHits(query: string, limit: number): Promise<NominatimSearchHit[]> {
  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  const features = await photonFetch(url);
  return features
    .map((f): NominatimSearchHit => {
      const [lon, lat] = f.geometry?.coordinates ?? [];
      return {
        lat: String(lat),
        lon: String(lon),
        display_name: photonDisplayName(f.properties) || `${lat}, ${lon}`,
        place_id: f.properties?.osm_id,
        osm_type: f.properties?.osm_type,
        type: f.properties?.osm_value,
      };
    })
    .filter((h) => Number.isFinite(Number(h.lat)) && Number.isFinite(Number(h.lon)));
}

async function photonReverse(lat: number, lon: number): Promise<NominatimReverseHit | null> {
  const url = new URL('https://photon.komoot.io/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  const features = await photonFetch(url);
  const f = features[0];
  if (!f) return null;
  const [flon, flat] = f.geometry?.coordinates ?? [];
  return {
    lat: String(flat ?? lat),
    lon: String(flon ?? lon),
    display_name: photonDisplayName(f.properties) || `${lat}, ${lon}`,
    place_id: f.properties?.osm_id,
    osm_type: f.properties?.osm_type,
    type: f.properties?.osm_value,
    address: undefined,
  };
}

async function applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const now = Date.now();
  const last = lastByIp.get(ip) || 0;
  if (now - last < MIN_INTERVAL_MS) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 },
    );
  }
  lastByIp.set(ip, now);
  return null;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function structuredCacheKey(
  street: string,
  city: string,
  state: string,
  postalcode: string,
  country: string,
): string {
  return `struct:${street}|${city}|${state}|${postalcode}|${country}`;
}

function buildStructuredSearchUrl(
  street: string,
  city: string,
  state: string,
  postalcode: string,
  country: string,
  limit: number,
): URL {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('street', street);
  url.searchParams.set('city', city);
  if (state) url.searchParams.set('state', state);
  if (postalcode) url.searchParams.set('postalcode', postalcode);
  url.searchParams.set('country', country);
  const lc = country.toLowerCase();
  if (lc === 'canada' || lc === 'ca') url.searchParams.set('countrycodes', 'ca');
  return url;
}

function buildForwardQueryUrl(q: string, limit: number): URL {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', q);
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', String(limit));
  return url;
}

async function nominatimForwardHits(url: URL): Promise<NominatimSearchHit[]> {
  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': userAgent(),
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
    cache: 'no-store',
  });
  const bodyText = await res.text();
  if (!res.ok) {
    console.error('[geocode] Nominatim search failed', res.status, bodyText.slice(0, 400));
    throw new Error('nominatim_forward_http');
  }
  let data: unknown;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new Error('nominatim_forward_json');
  }
  if (!Array.isArray(data)) {
    console.warn('[geocode] Nominatim forward returned non-array', bodyText.slice(0, 200));
    return [];
  }
  return data as NominatimSearchHit[];
}

function hitToForwardResult(top: NominatimSearchHit) {
  const lat = Number(top.lat);
  const lon = Number(top.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return {
    lat,
    lon,
    displayName: top.display_name || `${lat}, ${lon}`,
    placeId: top.place_id != null ? String(top.place_id) : undefined,
    osmType: top.osm_type,
    category: top.category,
    type: top.type,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latRaw = searchParams.get('lat');
    const lonRaw = searchParams.get('lon');

    const hasReverse = latRaw !== null && latRaw !== '' && lonRaw !== null && lonRaw !== '';

    if (hasReverse) {
      const parsed = reverseSchema.safeParse({ lat: latRaw, lon: lonRaw });
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
      }
      const { lat, lon } = parsed.data;
      const cacheKey = reverseCacheKey(lat, lon);

      try {
        const cached = await getCachedGeocode(cacheKey);
        if (cached) {
          return NextResponse.json({
            found: true,
            fromCache: true,
            reverse: true,
            ...cached.result,
          });
        }
      } catch (cacheErr) {
        console.warn('[geocode] reverse cache read failed:', cacheErr);
      }

      const limited = await applyRateLimit(req);
      if (limited) return limited;

      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lon));
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('zoom', '18');

      const res = await fetch(url.toString(), {
        headers: {
          'User-Agent': userAgent(),
          Accept: 'application/json',
          'Accept-Language': 'en',
        },
        cache: 'no-store',
      });

      const bodyText = await res.text();
      let top: NominatimReverseHit | null = null;
      if (res.ok) {
        try {
          top = JSON.parse(bodyText) as NominatimReverseHit;
        } catch {
          return NextResponse.json({ error: 'Invalid reverse geocode response' }, { status: 502 });
        }
      } else {
        console.error(
          '[geocode] Nominatim reverse failed',
          res.status,
          bodyText.slice(0, 400),
        );
        try {
          top = await photonReverse(lat, lon);
        } catch (fallbackErr) {
          console.error('[geocode] Photon reverse fallback failed:', fallbackErr);
        }
        if (!top) {
          return NextResponse.json({ error: 'Reverse geocoding failed' }, { status: 502 });
        }
      }
      if (!top || typeof top.display_name !== 'string') {
        const fallback = {
          lat,
          lon,
          displayName: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        };
        try {
          await setCachedGeocode(cacheKey, fallback, 30);
        } catch (cacheErr) {
          console.warn('[geocode] reverse cache write failed:', cacheErr);
        }
        return NextResponse.json({
          found: true,
          fromCache: false,
          reverse: true,
          ...fallback,
        });
      }

      const rLat = Number(top.lat);
      const rLon = Number(top.lon);
      if (!Number.isFinite(rLat) || !Number.isFinite(rLon)) {
        return NextResponse.json({ error: 'Invalid reverse geocode result' }, { status: 502 });
      }

      const result = {
        lat: rLat,
        lon: rLon,
        displayName: top.display_name,
        placeId: top.place_id != null ? String(top.place_id) : undefined,
        osmType: top.osm_type,
        category: top.category,
        type: top.type,
        address: top.address,
      };

      try {
        await setCachedGeocode(cacheKey, result, 30);
      } catch (cacheErr) {
        console.warn('[geocode] reverse cache write failed:', cacheErr);
      }

      return NextResponse.json({ found: true, fromCache: false, reverse: true, ...result });
    }

    const street = (searchParams.get('street') || '').trim();
    const city = (searchParams.get('city') || '').trim();
    const state = (searchParams.get('state') || '').trim();
    const postalcode = (searchParams.get('postalcode') || '').trim();
    const country = (searchParams.get('country') || 'Canada').trim() || 'Canada';
    const q = (searchParams.get('q') || '').trim();
    const hasStructuredFwd = Boolean(street && city);

    const limitParsed = forwardLimitSchema.safeParse(searchParams.get('limit') || '1');
    if (!limitParsed.success) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
    }
    const limit = limitParsed.data;

    if (q.length > 200) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    if (!hasStructuredFwd && q.length < 3) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    const sKey = hasStructuredFwd ? structuredCacheKey(street, city, state, postalcode, country) : null;

    try {
      if (sKey) {
        const cached = await getCachedGeocode(sKey);
        if (cached) {
          return NextResponse.json({
            found: true,
            fromCache: true,
            reverse: false,
            ...cached.result,
          });
        }
      }
      if (q.length >= 3) {
        const cachedQ = await getCachedGeocode(q);
        if (cachedQ) {
          return NextResponse.json({
            found: true,
            fromCache: true,
            reverse: false,
            ...cachedQ.result,
          });
        }
      }
    } catch (cacheErr) {
      console.warn('[geocode] cache read failed, continuing without cache:', cacheErr);
    }

    const limited = await applyRateLimit(req);
    if (limited) return limited;

    let hits: NominatimSearchHit[] = [];
    let cacheWriteKey: string | null = null;

    try {
      if (hasStructuredFwd) {
        const sUrl = buildStructuredSearchUrl(street, city, state, postalcode, country, limit);
        hits = await nominatimForwardHits(sUrl);
        cacheWriteKey = sKey!;
        if (hits.length === 0 && q.length >= 3) {
          await sleep(MIN_INTERVAL_MS);
          hits = await nominatimForwardHits(buildForwardQueryUrl(q, limit));
          cacheWriteKey = q;
        }
      } else {
        hits = await nominatimForwardHits(buildForwardQueryUrl(q, limit));
        cacheWriteKey = q;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'nominatim_forward_http' || msg === 'nominatim_forward_json') {
        try {
          const fallbackQ = hasStructuredFwd
            ? [street, city, state, postalcode, country].filter(Boolean).join(', ')
            : q;
          hits = await photonForwardHits(fallbackQ, limit);
          cacheWriteKey = hasStructuredFwd ? sKey : q;
        } catch (fallbackErr) {
          console.error('[geocode] Photon forward fallback failed:', fallbackErr);
          return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
        }
      } else {
        throw e;
      }
    }

    if (hits.length === 0) {
      return NextResponse.json(
        {
          found: false,
          reverse: false,
          fromCache: false,
          error: 'No results found',
        },
        { status: 200 },
      );
    }

    const fwdTop = hits[0];
    const result = hitToForwardResult(fwdTop);
    if (!result) {
      return NextResponse.json({ error: 'Invalid geocode result' }, { status: 502 });
    }

    if (cacheWriteKey) {
      try {
        await setCachedGeocode(cacheWriteKey, result, 30);
      } catch (cacheErr) {
        console.warn('[geocode] cache write failed:', cacheErr);
      }
    }

    return NextResponse.json({ found: true, fromCache: false, reverse: false, ...result });
  } catch (error) {
    console.error('GET /api/geocode error:', error);
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
