import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { auth } from '@/auth';
import { businessClaimSchema } from '@/lib/validation/schemas';
import { BusinessClaimRequest } from '@/models/BusinessClaimRequest';
import { Place } from '@/models/Place';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/db/activity';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id || !session.user.name || !session.user.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validated = businessClaimSchema.parse(body);

    const placesCollection = await getCollection<Place>('places');
    const place = await placesCollection.findOne({ _id: new ObjectId(id) });
    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    if (place.isClaimed) {
      return NextResponse.json({ error: 'This place has already been claimed' }, { status: 409 });
    }

    const claimsCollection = await getCollection<BusinessClaimRequest>('businessClaimRequests');

    const existingClaim = await claimsCollection.findOne({
      placeId: new ObjectId(id),
      'requestedBy.userId': new ObjectId(session.user.id),
      status: { $in: ['submitted', 'under_review'] },
    });
    if (existingClaim) {
      return NextResponse.json({ error: 'You already have a pending claim for this place' }, { status: 409 });
    }

    const claim: Omit<BusinessClaimRequest, '_id'> = {
      placeId: new ObjectId(id),
      requestedBy: {
        userId: new ObjectId(session.user.id),
        name: session.user.name,
        email: session.user.email,
        role: validated.role,
      },
      verification: {
        businessEmail: validated.businessEmail || undefined,
        notes: validated.notes || '',
        uploadedProofUrl: validated.proofUrl || undefined,
      },
      status: 'submitted',
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await claimsCollection.insertOne(claim as BusinessClaimRequest);

    await logActivity({
      userId: session.user.id,
      type: 'business_claim_submitted',
      entityType: 'claim',
      entityId: result.insertedId.toString(),
      message: `Submitted claim for "${place.name}"`,
      metadata: { placeId: id, placeName: place.name },
    });

    return NextResponse.json(
      { claim: { id: result.insertedId.toString() } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    console.error('POST /api/places/[id]/claim error:', error);
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
  }
}
