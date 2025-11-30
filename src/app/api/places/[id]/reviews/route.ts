import { NextRequest, NextResponse } from 'next/server';
import { reviewSchema } from '@/lib/validation/schemas';
import { getCollection } from '@/lib/db/mongoClient';
import { Review } from '@/models/Review';
import { Place } from '@/models/Place';
import { User } from '@/models/User';
import { getSession } from '@/lib/auth/session';
import { getGridFSBucket } from '@/lib/db/mongoose';
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

    const reviewsCollection = await getCollection<Review>('reviews');
    const usersCollection = await getCollection<User>('users');

    const reviews = await reviewsCollection
      .find({ placeId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Fetch user names for reviews
    const userIds = [...new Set(reviews.map((r) => r.userId.toString()))];
    const users = await usersCollection
      .find({ _id: { $in: userIds.map((uid) => new ObjectId(uid)) } })
      .project({ _id: 1, name: 1 })
      .toArray();

    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    const reviewsWithAuthor = reviews.map((review) => ({
      id: review._id.toString(),
      placeId: review.placeId.toString(),
      userId: review.userId.toString(),
      authorName: userMap.get(review.userId.toString()) || 'Anonymous',
      rating: review.rating,
      comment: review.comment,
      photoIds: review.photoIds || [],
      createdAt: review.createdAt.toISOString(),
    }));

    return NextResponse.json({ reviews: reviewsWithAuthor });
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

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid place ID' },
        { status: 400 }
      );
    }

    // Verify place exists
    const placesCollection = await getCollection<Place>('places');
    const place = await placesCollection.findOne({ _id: new ObjectId(id) });
    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    // Parse FormData (supports both JSON and multipart/form-data)
    const contentType = request.headers.get('content-type') || '';
    let rating: number;
    let comment: string;
    let photoIds: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      // Handle file uploads
      const formData = await request.formData();
      
      rating = Number(formData.get('rating'));
      comment = formData.get('comment') as string;
      const photos = formData.getAll('photos') as File[];

      if (!rating || !comment) {
        return NextResponse.json(
          { error: 'Rating and comment are required' },
          { status: 400 }
        );
      }

      // Upload photos to GridFS
      const bucket = await getGridFSBucket();
      const uploadPromises = photos.map(async (photo) => {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `photo_${Date.now()}_${photo.name}`;

        return new Promise<string>((resolve, reject) => {
          const uploadStream = bucket.openUploadStream(filename, {
            contentType: photo.type,
            metadata: {
              placeId: id,
              userId: session.userId,
            },
          });

          uploadStream.on('finish', () => {
            resolve(uploadStream.id.toString());
          });

          uploadStream.on('error', (error) => {
            reject(error);
          });

          uploadStream.end(buffer);
        });
      });

      photoIds = await Promise.all(uploadPromises);
    } else {
      // Handle JSON request (backward compatibility)
      const body = await request.json();
      const validated = reviewSchema.parse(body);
      rating = validated.rating;
      comment = validated.comment;
      // photoUrls can be converted to photoIds if needed
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const reviewsCollection = await getCollection<Review>('reviews');

    const newReview: Omit<Review, '_id'> = {
      placeId: new ObjectId(id),
      userId: new ObjectId(session.userId),
      rating,
      comment,
      photoIds, // Store GridFS IDs instead of URLs
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reviewsCollection.insertOne(newReview as Review);
    const reviewId = result.insertedId.toString();

    return NextResponse.json(
      {
        review: {
          id: reviewId,
          placeId: id,
          rating,
          comment,
          photoIds,
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
