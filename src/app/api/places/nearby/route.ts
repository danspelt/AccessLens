import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = Number(searchParams.get('lat'));
    const lng = Number(searchParams.get('lng'));
    const radius = Number(searchParams.get('radius') ?? '2000');

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    if (Number.isNaN(radius) || radius <= 0 || radius > 50_000) {
      return NextResponse.json(
        { error: 'radius must be a number between 1 and 50000 (meters)' },
        { status: 400 }
      );
    }

    const placesCollection = await getCollection<Place>('places');

    const query: any = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    };

    const category = searchParams.get('category');
    if (category && category !== 'all') {
      query.category = category;
    }

    const hasStepFree = searchParams.get('hasStepFree');
    if (hasStepFree === 'true') {
      query.stepFreeAccess = true;
    }

    const hasAccessibleWashroom = searchParams.get('hasAccessibleWashroom');
    if (hasAccessibleWashroom === 'true') {
      query.accessibleWashroom = true;
    }

    const hasAccessibleParking = searchParams.get('hasAccessibleParking');
    if (hasAccessibleParking === 'true') {
      query.accessibleParking = true;
    }

    const places = await placesCollection.find(query).limit(100).toArray();

    return NextResponse.json({ places });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
