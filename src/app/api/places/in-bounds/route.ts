import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';

const schema = z.object({
  west: z.coerce.number().min(-180).max(180),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  north: z.coerce.number().min(-90).max(90),
  limit: z.coerce.number().int().min(1).max(500).default(300),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = schema.parse({
      west: searchParams.get('west'),
      south: searchParams.get('south'),
      east: searchParams.get('east'),
      north: searchParams.get('north'),
      limit: searchParams.get('limit') || '300',
    });

    const places = await getCollection<Place>('places');

    const docs = await places
      .find({
        location: {
          $geoWithin: {
            $box: [
              [parsed.west, parsed.south],
              [parsed.east, parsed.north],
            ],
          },
        },
      })
      .limit(parsed.limit)
      .toArray();

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
    console.error('GET /api/places/in-bounds error:', error);
    return NextResponse.json({ error: 'Failed to fetch places in bounds' }, { status: 500 });
  }
}

