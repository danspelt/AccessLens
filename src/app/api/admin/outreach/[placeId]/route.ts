import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import type { VerificationLevel } from '@/lib/accessibility/tags';

const actionSchema = z.object({
  action: z.enum(['publish', 'reject', 'mark_student_verified']),
  reviewNotes: z.string().max(1000).optional(),
});

interface RouteContext {
  params: Promise<{ placeId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { placeId } = await context.params;
  if (!ObjectId.isValid(placeId)) {
    return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action } = actionSchema.parse(body);
    const now = new Date();

    const places = await getCollection<Place>('places');
    const place = await places.findOne({ _id: new ObjectId(placeId) });
    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    let verificationLevel: VerificationLevel | undefined = place.verificationLevel;
    let outreachStatus = place.outreachStatus;
    let status = place.status;

    if (action === 'publish') {
      outreachStatus = 'published';
      status = 'active';
      verificationLevel = verificationLevel ?? 'business_submitted';
    } else if (action === 'reject') {
      outreachStatus = 'claimed';
      status = 'pending_review';
    } else if (action === 'mark_student_verified') {
      verificationLevel = 'student_verified';
      outreachStatus = outreachStatus === 'published' ? 'published' : 'pending_review';
    }

    await places.updateOne(
      { _id: new ObjectId(placeId) },
      {
        $set: {
          outreachStatus,
          status,
          verificationLevel,
          verifiedAt: action === 'publish' || action === 'mark_student_verified' ? now : place.verifiedAt,
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({ success: true, outreachStatus, verificationLevel, status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    console.error('POST /api/admin/outreach/[placeId] error:', error);
    return NextResponse.json({ error: 'Failed to update place' }, { status: 500 });
  }
}
