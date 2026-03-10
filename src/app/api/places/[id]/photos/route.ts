import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongoClient';
import { getSession } from '@/lib/auth/session';
import { isDatabaseConfigured } from '@/lib/accesslens/data';
import { placePhotoSchema } from '@/lib/validation/schemas';
import { Place } from '@/models/Place';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured. Add MONGODB_URI and MONGODB_DB to enable uploads.' },
        { status: 503 }
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
    }

    const body = await request.json();
    const validated = placePhotoSchema.parse(body);
    const placesCollection = await getCollection<Place>('places');
    const result = await placesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          photoUrls: {
            $each: validated.photoUrls,
          },
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: error.message }, { status: 400 });
    }

    console.error('Error attaching place photos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
