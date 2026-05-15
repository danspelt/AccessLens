import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { Place, type OutreachStatus } from '@/models/Place';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get('status') || 'pending_review') as OutreachStatus;
  const citySlug = searchParams.get('citySlug') || 'victoria-bc';

  const places = await getCollection<Place>('places');
  const rows = await places
    .find({ citySlug, outreachStatus: status })
    .sort({ lastUpdatedByBusinessAt: -1, updatedAt: -1 })
    .limit(100)
    .toArray();

  return NextResponse.json({
    places: rows.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      address: p.address,
      category: p.category,
      outreachStatus: p.outreachStatus,
      verificationLevel: p.verificationLevel ?? null,
      accessibilityScore: p.accessibilityScore ?? null,
      businessContact: p.businessContact ?? null,
      publicNotes: p.accessibilityProfile?.publicNotes ?? p.accessibilityNotes ?? null,
      photoCount: p.photoUrls?.length ?? 0,
      lastUpdatedByBusinessAt: p.lastUpdatedByBusinessAt?.toISOString() ?? null,
      updatedAt: p.updatedAt.toISOString(),
    })),
  });
}
