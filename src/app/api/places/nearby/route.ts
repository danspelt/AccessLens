import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  km: z.coerce.number().min(0.1).max(50).default(5),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = schema.parse({
      lat: searchParams.get('lat'),
      lon: searchParams.get('lon'),
      km: searchParams.get('km') || '5',
      limit: searchParams.get('limit') || '100',
    });

    const places = await getCollection<Place>('places');
    const maxDistanceMeters = parsed.km * 1000;

    const cursor = places
      .find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parsed.lon, parsed.lat] },
            $maxDistance: maxDistanceMeters,
          },
        },
      })
      .limit(parsed.limit);

    const docs = await cursor.toArray();
    const serialized = docs.map((p) => ({
      ...p,
      _id: p._id.toString(),
      createdByUserId: p.createdByUserId.toString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ places: serialized });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    console.error('GET /api/places/nearby error:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby places' }, { status: 500 });
  }
}

