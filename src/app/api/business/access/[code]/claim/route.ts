import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { findPlaceByAccessCode } from '@/lib/db/placesByAccessCode';
import { getCollection } from '@/lib/db/mongoClient';
import { requireBusinessAccessForPlace } from '@/lib/business/session';
import { businessAccessClaimSchema } from '@/lib/validation/schemas';
import { Place } from '@/models/Place';
import { normalizeAccessCode } from '@/lib/access/codeFormat';

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

  try {
    const body = await request.json();
    const validated = businessAccessClaimSchema.parse(body);
    const now = new Date();

    const places = await getCollection<Place>('places');
    await places.updateOne(
      { _id: new ObjectId(place._id) },
      {
        $set: {
          businessContact: {
            name: validated.contactName,
            email: validated.contactEmail,
            phone: validated.contactPhone,
            role: validated.role,
          },
          outreachStatus: 'claimed',
          isClaimed: true,
          partnerLabel: 'accessibility_partner',
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 });
    }
    console.error('business claim error:', error);
    return NextResponse.json({ error: 'Failed to save claim' }, { status: 500 });
  }
}
