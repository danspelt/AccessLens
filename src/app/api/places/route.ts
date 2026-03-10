import { NextRequest, NextResponse } from 'next/server';
import {
  calculateAccessibilityScore,
  createCitySlug,
  createPlaceSlug,
  getAccessibilityStatus,
} from '@/lib/accesslens/constants';
import { isDatabaseConfigured, listPlaces, serializePlace } from '@/lib/accesslens/data';
import { placeSchema } from '@/lib/validation/schemas';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { getSession } from '@/lib/auth/session';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const citySlug = searchParams.get('citySlug') ?? undefined;
    const category = searchParams.get('category');
    const search = searchParams.get('search') ?? undefined;
    const ramp = searchParams.get('ramp') === 'true';
    const automaticDoor = searchParams.get('automaticDoor') === 'true';
    const elevator = searchParams.get('elevator') === 'true';
    const accessibleWashroom = searchParams.get('accessibleWashroom') === 'true';
    const accessibleParking = searchParams.get('accessibleParking') === 'true';
    const wideAisles = searchParams.get('wideAisles') === 'true';
    const smoothPath = searchParams.get('smoothPath') === 'true';

    const places = await listPlaces({
      citySlug,
      category: category && category !== 'all' ? (category as Place['category']) : undefined,
      search,
      ramp,
      automaticDoor,
      elevator,
      accessibleWashroom,
      accessibleParking,
      wideAisles,
      smoothPath,
    });

    return NextResponse.json({ places: places.map(serializePlace) });
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

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured. Add MONGODB_URI and MONGODB_DB to enable submissions.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validated = placeSchema.parse(body);

    const placesCollection = await getCollection<Place>('places');
    const accessibilityScore = calculateAccessibilityScore(validated.accessibilityChecklist);
    const accessibilityStatus = getAccessibilityStatus(accessibilityScore);
    const citySlug = createCitySlug(validated.city, validated.province);
    const baseSlug = createPlaceSlug(validated.name);
    const existingSlugCount = await placesCollection.countDocuments({
      citySlug,
      category: validated.category,
      slug: { $regex: `^${baseSlug}` },
    });
    const slug = existingSlugCount > 0 ? `${baseSlug}-${existingSlugCount + 1}` : baseSlug;

    const newPlace: Omit<Place, '_id'> = {
      ...validated,
      slug,
      citySlug,
      accessibilityScore,
      accessibilityStatus,
      createdByUserId: new ObjectId(session.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await placesCollection.insertOne(newPlace as Place);
    const placeId = result.insertedId.toString();

    return NextResponse.json(
      {
        place: serializePlace({ _id: result.insertedId, ...newPlace }),
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

