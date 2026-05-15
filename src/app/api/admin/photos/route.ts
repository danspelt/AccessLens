import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { PlacePhoto, type PlacePhotoStatus } from '@/models/PlacePhoto';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const status = (new URL(request.url).searchParams.get('status') || 'pending') as PlacePhotoStatus;

  const photos = await getCollection<PlacePhoto>('placePhotos');
  const rows = await photos.find({ status }).sort({ createdAt: -1 }).limit(100).toArray();

  return NextResponse.json({
    photos: rows.map((p) => ({
      id: p._id.toString(),
      placeId: p.placeId.toString(),
      placeName: p.placeName,
      url: p.url,
      photoType: p.photoType,
      status: p.status,
      uploadedBy: p.uploadedBy,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}
