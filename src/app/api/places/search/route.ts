import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get('q') ?? '').trim();
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');

    if (!q) {
      return NextResponse.json({ error: 'q is required' }, { status: 400 });
    }

    const lat = latParam !== null ? Number(latParam) : undefined;
    const lng = lngParam !== null ? Number(lngParam) : undefined;
    void lat;
    void lng;

    const placesCollection = await getCollection<Place>('places');

    const query: any = {
      $text: { $search: q },
    };

    const cursor = placesCollection
      .find(query, {
        projection: {
          score: { $meta: 'textScore' },
        },
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);

    const places = await cursor.toArray();

    return NextResponse.json({ places });
  } catch (error) {
    console.error('Error searching places:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
