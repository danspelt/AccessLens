import { NextRequest, NextResponse } from 'next/server';
import { reviewSchema } from '@/lib/validation/schemas';
import { getCollection } from '@/lib/db/mongoClient';
import { Review } from '@/models/Review';
import { Place } from '@/models/Place';
import { getSession } from '@/lib/auth/session';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid place ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    // Verify place exists
    const placesCollection = await getCollection<Place>('places');
    const place = await placesCollection.findOne({ _id: new ObjectId(id) });
    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    // Verify placeId matches
    if (validated.placeId !== id) {
      return NextResponse.json(
        { error: 'Place ID mismatch' },
        { status: 400 }
      );
    }

    const reviewsCollection = await getCollection<Review>('reviews');

    const newReview: Omit<Review, '_id'> = {
      placeId: new ObjectId(id),
      userId: new ObjectId(session.userId),
      rating: validated.rating,
      comment: validated.comment,
      photoUrls: validated.photoUrls,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reviewsCollection.insertOne(newReview as Review);
    const reviewId = result.insertedId.toString();

    return NextResponse.json(
      {
        review: {
          id: reviewId,
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

    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

