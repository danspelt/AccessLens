import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { auth } from '@/auth';
import { placeSubmissionSchema } from '@/lib/validation/schemas';
import { PlaceSubmission } from '@/models/PlaceSubmission';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/db/activity';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = placeSubmissionSchema.parse(body);

    const checklist: Record<string, boolean> = {};
    if (validated.accessibilityData.checklist) {
      for (const [key, val] of Object.entries(validated.accessibilityData.checklist)) {
        if (typeof val === 'boolean') checklist[key] = val;
      }
    }

    const location =
      validated.latitude !== undefined && validated.longitude !== undefined
        ? { type: 'Point' as const, coordinates: [validated.longitude, validated.latitude] as [number, number] }
        : undefined;

    const submission: Omit<PlaceSubmission, '_id'> = {
      placeData: {
        name: validated.placeData.name,
        category: validated.placeData.category,
        address: validated.placeData.address,
        city: validated.placeData.city,
        province: validated.placeData.province,
        postalCode: validated.placeData.postalCode,
        country: validated.placeData.country || 'Canada',
        phone: validated.placeData.phone || undefined,
        website: validated.placeData.website || undefined,
        email: validated.placeData.email || undefined,
        description: validated.placeData.description || undefined,
      },
      location,
      latitude: validated.latitude,
      longitude: validated.longitude,
      entrancePinned: validated.entrancePinned,
      accessibilityData: {
        checklist,
        generalNotes: validated.accessibilityData.generalNotes || undefined,
      },
      photoUrls: validated.photoUrls || [],
      submittedBy: {
        userId: new ObjectId(session.user.id),
        name: validated.submitter.name,
        email: validated.submitter.email,
        role: validated.submitter.role,
        isOwnerOrManager: validated.submitter.isOwnerOrManager,
      },
      status: 'submitted',
      adminReview: {
        reviewedBy: null,
        reviewedAt: null,
        notes: '',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = await getCollection<PlaceSubmission>('placeSubmissions');
    const result = await collection.insertOne(submission as PlaceSubmission);

    await logActivity({
      userId: session.user.id,
      type: 'place_submitted',
      entityType: 'submission',
      entityId: result.insertedId.toString(),
      message: `Submitted "${validated.placeData.name}" for review`,
      metadata: { placeName: validated.placeData.name },
    });

    return NextResponse.json(
      { submission: { id: result.insertedId.toString() } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    console.error('POST /api/place-submissions error:', error);
    return NextResponse.json({ error: 'Failed to submit place' }, { status: 500 });
  }
}
