import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCachedGeocode, setCachedGeocode } from '@/lib/db/geocode';

// Simple per-instance limiter (best-effort). Cache does the heavy lifting.
const lastByIp = new Map<string, number>();
const MIN_INTERVAL_MS = 1100; // ~1 req/sec

const forwardSchema = z.object({
  q: z.string().min(3).max(200),
  limit: z.coerce.number().int().min(1).max(3).default(1),
});

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

      const cached = await getCachedGeocode(cacheKey);
      if (cached) {
        return NextResponse.json({ fromCache: true, reverse: true, ...cached.result });
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
      if (!res.ok) {
        console.error(
          '[geocode] Nominatim reverse failed',
          res.status,
          bodyText.slice(0, 400),
        );
        return NextResponse.json({ error: 'Reverse geocoding failed' }, { status: 502 });
      }

      let top: NominatimReverseHit;
      try {
        top = JSON.parse(bodyText) as NominatimReverseHit;
      } catch {
        return NextResponse.json({ error: 'Invalid reverse geocode response' }, { status: 502 });
      }
      if (!top || typeof top.display_name !== 'string') {
        return NextResponse.json({ error: 'No result for this location' }, { status: 404 });
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

      await setCachedGeocode(cacheKey, result, 30);

      return NextResponse.json({ fromCache: false, reverse: true, ...result });
    }

    const parsed = forwardSchema.safeParse({
      q: searchParams.get('q') || '',
      limit: searchParams.get('limit') || '1',
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    const { q, limit } = parsed.data;

    const cached = await getCachedGeocode(q);
    if (cached) {
      return NextResponse.json({ fromCache: true, reverse: false, ...cached.result });
    }

    const limited = await applyRateLimit(req);
    if (limited) return limited;

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('q', q);
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': userAgent(),
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
    }

    const data = (await res.json()) as NominatimSearchHit[];
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    const top = data[0];
    const lat = Number(top.lat);
    const lon = Number(top.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: 'Invalid geocode result' }, { status: 502 });
    }

    const result = {
      lat,
      lon,
      displayName: top.display_name,
      placeId: top.place_id != null ? String(top.place_id) : undefined,
      osmType: top.osm_type,
      category: top.category,
      type: top.type,
    };

    await setCachedGeocode(q, result, 30);

    return NextResponse.json({ fromCache: false, reverse: false, ...result });
  } catch (error) {
    console.error('GET /api/geocode error:', error);
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
