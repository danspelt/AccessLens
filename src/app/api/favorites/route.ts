import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import { Favorite } from '@/models/Favorite';
import { Place } from '@/models/Place';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { logActivity } from '@/lib/db/activity';

const toggleSchema = z.object({
  placeId: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const favorites = await getCollection<Favorite>('favorites');
  const places = await getCollection<Place>('places');

  const favs = await favorites
    .find({ userId: new ObjectId(session.user.id) })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const placeIds = favs.map((f) => f.placeId);
  const placeDocs =
    placeIds.length > 0
      ? await places
          .find({ _id: { $in: placeIds } })
          .project({ _id: 1, name: 1, category: 1, address: 1, city: 1, province: 1, accessibilityScore: 1 })
          .toArray()
      : [];
  const placeMap = new Map(placeDocs.map((p) => [p._id.toString(), p]));

  return NextResponse.json({
    favorites: favs
      .map((f) => {
        const place = placeMap.get(f.placeId.toString());
        if (!place) return null;
        return {
          id: f._id.toString(),
          placeId: f.placeId.toString(),
          createdAt: f.createdAt.toISOString(),
          place: {
            id: place._id.toString(),
            name: (place as unknown as Place).name,
            category: (place as unknown as Place).category,
            address: (place as unknown as Place).address,
            city: (place as unknown as Place).city,
            province: (place as unknown as Place).province,
            accessibilityScore: (place as unknown as Place).accessibilityScore,
          },
        };
      })
      .filter(Boolean),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = toggleSchema.parse(body);
    if (!ObjectId.isValid(parsed.placeId)) {
      return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
    }

    const placeId = new ObjectId(parsed.placeId);
    const userId = new ObjectId(session.user.id);

    const places = await getCollection<Place>('places');
    const place = await places.findOne({ _id: placeId }, { projection: { _id: 1, name: 1 } });
    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const favorites = await getCollection<Favorite>('favorites');
    const existing = await favorites.findOne({ userId, placeId });

    if (existing) {
      await favorites.deleteOne({ _id: existing._id });
      await logActivity({
        userId: session.user.id,
        type: 'favorite_removed',
        entityType: 'place',
        entityId: parsed.placeId,
        message: `Removed ${place.name} from favorites`,
        metadata: { placeId: parsed.placeId, placeName: place.name },
      });
      return NextResponse.json({ favorited: false });
    }

    await favorites.insertOne({
      userId,
      placeId,
      createdAt: new Date(),
    } as unknown as Favorite);

    await logActivity({
      userId: session.user.id,
      type: 'favorite_added',
      entityType: 'place',
      entityId: parsed.placeId,
      message: `Added ${place.name} to favorites`,
      metadata: { placeId: parsed.placeId, placeName: place.name },
    });

    return NextResponse.json({ favorited: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('POST /api/favorites error:', error);
    return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 });
  }
}

