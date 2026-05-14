import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { auth } from '@/auth';
import { accessibilityUpdateSchema } from '@/lib/validation/schemas';
import { AccessibilityUpdateRequest } from '@/models/AccessibilityUpdateRequest';
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
    const validated = accessibilityUpdateSchema.parse(body);

    const placesCollection = await getCollection<Place>('places');
    const place = await placesCollection.findOne({ _id: new ObjectId(id) });
    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const checklist: Record<string, boolean> = {};
    if (validated.checklist) {
      for (const [key, val] of Object.entries(validated.checklist)) {
        if (typeof val === 'boolean') checklist[key] = val;
      }
    }

    const updateRequest: Omit<AccessibilityUpdateRequest, '_id'> = {
      placeId: new ObjectId(id),
      placeName: place.name,
      updatedChecklist: checklist,
      updatedNotes: validated.notes || undefined,
      photoUrls: validated.photoUrls || [],
      submittedBy: {
        userId: new ObjectId(session.user.id),
        name: session.user.name,
        email: session.user.email,
      },
      status: 'submitted',
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = await getCollection<AccessibilityUpdateRequest>('accessibilityUpdateRequests');
    const result = await collection.insertOne(updateRequest as AccessibilityUpdateRequest);

    await logActivity({
      userId: session.user.id,
      type: 'accessibility_update_submitted',
      entityType: 'submission',
      entityId: result.insertedId.toString(),
      message: `Submitted accessibility update for "${place.name}"`,
      metadata: { placeId: id, placeName: place.name },
    });

    return NextResponse.json(
      { update: { id: result.insertedId.toString() } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    console.error('POST /api/places/[id]/update-accessibility error:', error);
    return NextResponse.json({ error: 'Failed to submit update' }, { status: 500 });
  }
}
