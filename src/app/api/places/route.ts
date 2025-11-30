import { NextRequest, NextResponse } from 'next/server';
import { placeSchema } from '@/lib/validation/schemas';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { getSession } from '@/lib/auth/session';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const hasStepFree = searchParams.get('hasStepFree');
    const hasAccessibleWashroom = searchParams.get('hasAccessibleWashroom');
    const hasAccessibleParking = searchParams.get('hasAccessibleParking');

    const placesCollection = await getCollection<Place>('places');

    // Build query
    const query: any = {};
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (hasStepFree === 'true') {
      query.stepFreeAccess = true;
    }
    if (hasAccessibleWashroom === 'true') {
      query.accessibleWashroom = true;
    }
    if (hasAccessibleParking === 'true') {
      query.accessibleParking = true;
    }

    const places = await placesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ places });
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = placeSchema.parse(body);

    const placesCollection = await getCollection<Place>('places');

    const newPlace: Omit<Place, '_id'> = {
      ...validated,
      createdByUserId: new ObjectId(session.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await placesCollection.insertOne(newPlace as Place);
    const placeId = result.insertedId.toString();

    return NextResponse.json(
      {
        place: {
          id: placeId,
          ...validated,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

