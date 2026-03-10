import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { getSession } from '@/lib/auth/session';
import { reviewSchema } from '@/lib/validation/schemas';
import { Review } from '@/models/Review';
import { Place } from '@/models/Place';
import { User } from '@/models/User';
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

    const reviewsCollection = await getCollection<Review>('reviews');
    const usersCollection = await getCollection<User>('users');

    const reviews = await reviewsCollection
      .find({ placeId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const userIds = [...new Set(reviews.map((r) => r.userId.toString()))];
    const users = await usersCollection
      .find({ _id: { $in: userIds.map((uid) => new ObjectId(uid)) } })
      .project({ _id: 1, name: 1 })
      .toArray();

    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    const serialized = reviews.map((r) => ({
      ...r,
      _id: r._id.toString(),
      placeId: r.placeId.toString(),
      userId: r.userId.toString(),
      authorName: userMap.get(r.userId.toString()) || 'Anonymous',
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({ reviews: serialized });
  } catch (error) {
    console.error('GET /api/places/[id]/reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
    }

    const placesCollection = await getCollection<Place>('places');
    const place = await placesCollection.findOne({ _id: new ObjectId(id) });
    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    const reviewsCollection = await getCollection<Review>('reviews');

    const review: Omit<Review, '_id'> = {
      placeId: new ObjectId(id),
      userId: new ObjectId(session.userId),
      rating: validated.rating,
      comment: validated.comment,
      photoUrls: validated.photoUrls || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reviewsCollection.insertOne(review as Review);

    return NextResponse.json(
      { review: { id: result.insertedId.toString(), ...review } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    console.error('POST /api/places/[id]/reviews error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
