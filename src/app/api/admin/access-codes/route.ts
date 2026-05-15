import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { generateUniqueAccessCode } from '@/lib/access/codes';
import { Place } from '@/models/Place';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const outreachStatus = searchParams.get('outreachStatus');
  const citySlug = searchParams.get('citySlug') || 'victoria-bc';

  const filter: Record<string, unknown> = { citySlug };
  if (outreachStatus) filter.outreachStatus = outreachStatus;

  const places = await getCollection<Place>('places');
  const rows = await places
    .find(filter)
    .project({
      name: 1,
      address: 1,
      accessCode: 1,
      outreachStatus: 1,
      verificationLevel: 1,
      isClaimed: 1,
      lastUpdatedByBusinessAt: 1,
    })
    .sort({ name: 1 })
    .limit(500)
    .toArray();

  return NextResponse.json({
    places: rows.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      address: p.address,
      accessCode: p.accessCode ?? null,
      outreachStatus: p.outreachStatus ?? 'unclaimed',
      verificationLevel: p.verificationLevel ?? null,
      isClaimed: p.isClaimed,
      lastUpdatedByBusinessAt: p.lastUpdatedByBusinessAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const body = await request.json();
    const placeId = body.placeId as string | undefined;
    const regenerate = Boolean(body.regenerate);

    if (!placeId || !ObjectId.isValid(placeId)) {
      return NextResponse.json({ error: 'Valid placeId is required' }, { status: 400 });
    }

    const places = await getCollection<Place>('places');
    const place = await places.findOne({ _id: new ObjectId(placeId) });
    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    if (place.accessCode && !regenerate) {
      return NextResponse.json({
        placeId,
        accessCode: place.accessCode,
        existing: true,
      });
    }

    const accessCode = await generateUniqueAccessCode();
    const now = new Date();

    await places.updateOne(
      { _id: new ObjectId(placeId) },
      {
        $set: {
          accessCode,
          outreachStatus: place.outreachStatus ?? 'unclaimed',
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({ placeId, accessCode, existing: false });
  } catch (error) {
    console.error('POST /api/admin/access-codes error:', error);
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }
}
