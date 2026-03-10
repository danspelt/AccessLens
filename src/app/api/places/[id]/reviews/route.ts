import { NextRequest, NextResponse } from 'next/server';
import { getPlaceById, getReviewsForPlace, isDatabaseConfigured, serializeReview } from '@/lib/accesslens/data';
import { reviewSchema } from '@/lib/validation/schemas';
import { getCollection } from '@/lib/db/mongoClient';
import { Review } from '@/models/Review';
import { getSession } from '@/lib/auth/session';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid place ID' },
        { status: 400 }
      );
    }

    const reviews = await getReviewsForPlace(new ObjectId(id));

    return NextResponse.json({
      reviews: reviews.map((review) => serializeReview(review)),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured. Add MONGODB_URI and MONGODB_DB to enable reviews.' },
        { status: 503 }
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
    const place = await getPlaceById(id);
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
      headline: validated.headline,
      comment: validated.comment,
      accessibilityNotes: validated.accessibilityNotes,
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

