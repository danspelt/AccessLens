import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { auth } from '@/auth';
import { placeSchema } from '@/lib/validation/schemas';
import { Place, calculateAccessibilityScore } from '@/models/Place';
import { Review } from '@/models/Review';
import { ObjectId } from 'mongodb';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
    }

    const placesCollection = await getCollection<Place>('places');
    const reviewsCollection = await getCollection<Review>('reviews');

    const place = await placesCollection.findOne({ _id: new ObjectId(id) });
    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const reviews = await reviewsCollection
      .find({ placeId: new ObjectId(id) })
      .toArray();

    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    return NextResponse.json({
      place: {
        ...place,
        _id: place._id.toString(),
        createdByUserId: place.createdByUserId.toString(),
        createdAt: place.createdAt.toISOString(),
        updatedAt: place.updatedAt.toISOString(),
      },
      stats: { reviewCount: reviews.length, avgRating },
    });
  } catch (error) {
    console.error('GET /api/places/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch place' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
    }

    const body = await request.json();
    const validated = placeSchema.partial().parse(body);
    const checklist = validated.checklist || {};
    const accessibilityScore = calculateAccessibilityScore(checklist);

    const placesCollection = await getCollection<Place>('places');
    const result = await placesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...validated, accessibilityScore, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/places/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update place' }, { status: 500 });
  }
}
