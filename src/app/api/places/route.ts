import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { auth } from '@/auth';
import { placeSchema } from '@/lib/validation/schemas';
import { Place, calculateAccessibilityScore } from '@/models/Place';
import { ObjectId } from 'mongodb';
import slugify from 'slugify';
import { logActivity } from '@/lib/db/activity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const hasStepFree = searchParams.get('hasStepFree');
    const hasAccessibleWashroom = searchParams.get('hasAccessibleWashroom');
    const hasAccessibleParking = searchParams.get('hasAccessibleParking');
    const hasElevator = searchParams.get('hasElevator');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    const placesCollection = await getCollection<Place>('places');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (city) query.citySlug = city;
    if (category) query.category = category;
    if (hasStepFree === 'true') query['checklist.entranceRamp'] = true;
    if (hasAccessibleWashroom === 'true') query['checklist.accessibleWashroom'] = true;
    if (hasAccessibleParking === 'true') query['checklist.accessibleParking'] = true;
    if (hasElevator === 'true') query['checklist.elevator'] = true;
    if (search) query.name = { $regex: search, $options: 'i' };

    const places = await placesCollection
      .find(query)
      .sort({ accessibilityScore: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    const serialized = places.map((p) => ({
      ...p,
      _id: p._id.toString(),
      createdByUserId: p.createdByUserId.toString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ places: serialized });
  } catch (error) {
    console.error('GET /api/places error:', error);
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = placeSchema.parse(body);

    const slug = slugify(validated.name, { lower: true, strict: true });
    const citySlug = validated.citySlug || 'victoria-bc';
    const checklist = validated.checklist || {};
    const accessibilityScore = calculateAccessibilityScore(checklist);

    const place: Omit<Place, '_id'> = {
      name: validated.name,
      slug,
      category: validated.category,
      address: validated.address,
      city: validated.city,
      citySlug,
      province: validated.province || 'BC',
      country: validated.country || 'Canada',
      description: validated.description,
      website: validated.website || undefined,
      phone: validated.phone || undefined,
      checklist,
      accessibilityScore,
      accessibilityNotes: validated.accessibilityNotes,
      photoUrls: [],
      latitude: validated.latitude,
      longitude: validated.longitude,
      location:
        validated.location ||
        (validated.latitude !== undefined && validated.longitude !== undefined
          ? { type: 'Point', coordinates: [validated.longitude, validated.latitude] }
          : undefined),
      createdByUserId: new ObjectId(session.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const placesCollection = await getCollection<Place>('places');
    const result = await placesCollection.insertOne(place as Place);

    await logActivity({
      userId: session.user.id,
      type: 'place_created',
      entityType: 'place',
      entityId: result.insertedId.toString(),
      message: `Added ${place.name}`,
      metadata: { placeId: result.insertedId.toString(), placeName: place.name },
    });

    return NextResponse.json(
      { place: { id: result.insertedId.toString(), ...place } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    console.error('POST /api/places error:', error);
    return NextResponse.json({ error: 'Failed to create place' }, { status: 500 });
  }
}
