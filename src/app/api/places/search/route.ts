import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ places: [] });
    }

    const placesCollection = await getCollection<Place>('places');

    const places = await placesCollection
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { address: { $regex: query, $options: 'i' } },
        ],
        $and: [
          { $or: [{ status: 'active' as const }, { status: { $exists: false } }] },
        ],
      })
      .project({
        _id: 1,
        name: 1,
        slug: 1,
        category: 1,
        address: 1,
        city: 1,
        province: 1,
        accessibilityScore: 1,
      })
      .sort({ accessibilityScore: -1 })
      .limit(10)
      .toArray();

    const serialized = places.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    return NextResponse.json({ places: serialized });
  } catch (error) {
    console.error('GET /api/places/search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
