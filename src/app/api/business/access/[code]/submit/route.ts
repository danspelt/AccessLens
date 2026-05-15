import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { findPlaceByAccessCode } from '@/lib/db/placesByAccessCode';
import { getCollection } from '@/lib/db/mongoClient';
import { requireBusinessAccessForPlace } from '@/lib/business/session';
import { businessAccessSubmitSchema } from '@/lib/validation/schemas';
import { Place, calculateAccessibilityScore } from '@/models/Place';
import { profileToChecklist } from '@/lib/accessibility/syncChecklist';
import { normalizeAccessCode } from '@/lib/access/codeFormat';
import type { AccessibilityProfile } from '@/models/AccessibilityProfile';
import { createPendingBusinessPhotos } from '@/lib/db/placePhotos';

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { code: rawCode } = await context.params;
  const code = normalizeAccessCode(rawCode);
  const place = await findPlaceByAccessCode(code);

  if (!place) {
    return NextResponse.json({ error: 'Invalid or expired access code' }, { status: 404 });
  }

  const session = await requireBusinessAccessForPlace(place._id.toString());
  if (!session || session.accessCode !== code) {
    return NextResponse.json({ error: 'Please verify your access code first' }, { status: 403 });
  }

  if (!place.businessContact?.email) {
    return NextResponse.json({ error: 'Please complete the claim step first' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validated = businessAccessSubmitSchema.parse(body);
    const profile = validated.profile as AccessibilityProfile;
    const checklist = profileToChecklist(profile);
    const score = calculateAccessibilityScore(checklist);
    const now = new Date();
    const outreachStatus = validated.publish ? 'pending_review' : 'claimed';

    const places = await getCollection<Place>('places');
    const newPhotoUrls = validated.photoUrls ?? [];

    if (validated.publish && newPhotoUrls.length > 0 && place.businessContact) {
      await createPendingBusinessPhotos(
        new ObjectId(place._id),
        place.name,
        newPhotoUrls,
        { name: place.businessContact.name, email: place.businessContact.email }
      );
    }

    const photoUrls =
      validated.publish
        ? place.photoUrls ?? []
        : [...new Set([...(place.photoUrls ?? []), ...newPhotoUrls])].slice(0, 20);

    await places.updateOne(
      { _id: new ObjectId(place._id) },
      {
        $set: {
          accessibilityProfile: profile,
          checklist,
          accessibilityScore: score,
          accessibilityNotes: profile.publicNotes ?? place.accessibilityNotes,
          photoUrls,
          outreachStatus,
          verificationLevel: 'business_submitted',
          lastUpdatedByBusinessAt: now,
          updatedAt: now,
          ...(validated.publish ? { status: 'pending_review' as const } : {}),
        },
      }
    );

    return NextResponse.json({
      success: true,
      outreachStatus,
      accessibilityScore: score,
      message: validated.publish
        ? 'Your update was submitted for review. Thank you for participating!'
        : 'Draft saved. You can return anytime with your access code.',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 });
    }
    console.error('business submit error:', error);
    return NextResponse.json({ error: 'Failed to save update' }, { status: 500 });
  }
}
