import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { PlacePhoto } from '@/models/PlacePhoto';
import { Place } from '@/models/Place';

const actionSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

interface RouteContext {
  params: Promise<{ photoId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { photoId } = await context.params;
  if (!ObjectId.isValid(photoId)) {
    return NextResponse.json({ error: 'Invalid photo ID' }, { status: 400 });
  }

  try {
    const { action } = actionSchema.parse(await request.json());
    const now = new Date();

    const photosCol = await getCollection<PlacePhoto>('placePhotos');
    const photo = await photosCol.findOne({ _id: new ObjectId(photoId) });
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const placesCol = await getCollection<Place>('places');
      const place = await placesCol.findOne({ _id: photo.placeId });
      const photoUrls = [...new Set([...(place?.photoUrls ?? []), photo.url])].slice(0, 20);

      await Promise.all([
        photosCol.updateOne(
          { _id: photo._id },
          {
            $set: {
              status: 'approved',
              reviewedBy: admin.user._id,
              reviewedAt: now,
              updatedAt: now,
            },
          }
        ),
        placesCol.updateOne(
          { _id: photo.placeId },
          { $set: { photoUrls, updatedAt: now } }
        ),
      ]);
    } else {
      await photosCol.updateOne(
        { _id: photo._id },
        {
          $set: {
            status: 'rejected',
            reviewedBy: admin.user._id,
            reviewedAt: now,
            updatedAt: now,
          },
        }
      );
    }

    return NextResponse.json({ success: true, status: action === 'approve' ? 'approved' : 'rejected' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    console.error('POST /api/admin/photos/[photoId] error:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}
