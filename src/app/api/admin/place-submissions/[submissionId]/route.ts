import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { auth } from '@/auth';
import { PlaceSubmission } from '@/models/PlaceSubmission';
import { Place, calculateAccessibilityScore } from '@/models/Place';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';
import slugify from 'slugify';
import { logActivity } from '@/lib/db/activity';

interface RouteContext {
  params: Promise<{ submissionId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const usersCollection = await getCollection<User>('users');
  const user = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { submissionId } = await context.params;
  if (!ObjectId.isValid(submissionId)) {
    return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, notes } = body as { action: string; notes?: string };

    const submissionsCollection = await getCollection<PlaceSubmission>('placeSubmissions');
    const submission = await submissionsCollection.findOne({ _id: new ObjectId(submissionId) });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const slug = slugify(submission.placeData.name, { lower: true, strict: true });
      const citySlug = slugify(`${submission.placeData.city}-${submission.placeData.province}`, {
        lower: true,
        strict: true,
      });

      const checklist = submission.accessibilityData.checklist || {};
      const accessibilityScore = calculateAccessibilityScore(checklist);

      const place: Omit<Place, '_id'> = {
        name: submission.placeData.name,
        slug,
        category: submission.placeData.category,
        address: submission.placeData.address,
        city: submission.placeData.city,
        citySlug,
        province: submission.placeData.province,
        postalCode: submission.placeData.postalCode,
        country: submission.placeData.country,
        description: submission.placeData.description,
        website: submission.placeData.website,
        phone: submission.placeData.phone,
        email: submission.placeData.email,
        checklist,
        accessibilityScore,
        accessibilityNotes: submission.accessibilityData.generalNotes,
        photoUrls: submission.photoUrls || [],
        latitude: submission.latitude,
        longitude: submission.longitude,
        location: submission.location,
        status: 'active',
        source: {
          type: submission.submittedBy.isOwnerOrManager ? 'business_submission' : 'community_submission',
          submittedByUserId: submission.submittedBy.userId,
          submittedByRole: submission.submittedBy.role,
          submissionId: submission._id,
        },
        isClaimed: submission.submittedBy.isOwnerOrManager,
        claimedByUserId: submission.submittedBy.isOwnerOrManager
          ? submission.submittedBy.userId
          : undefined,
        createdByUserId: submission.submittedBy.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const placesCollection = await getCollection<Place>('places');
      const placeResult = await placesCollection.insertOne(place as Place);

      await submissionsCollection.updateOne(
        { _id: submission._id },
        {
          $set: {
            status: 'approved',
            createdPlaceId: placeResult.insertedId,
            'adminReview.reviewedBy': new ObjectId(session.user.id),
            'adminReview.reviewedAt': new Date(),
            'adminReview.notes': notes || '',
            updatedAt: new Date(),
          },
        }
      );

      await logActivity({
        userId: session.user.id,
        type: 'place_submission_approved',
        entityType: 'submission',
        entityId: submissionId,
        message: `Approved "${submission.placeData.name}"`,
        metadata: {
          placeId: placeResult.insertedId.toString(),
          placeName: submission.placeData.name,
        },
      });

      return NextResponse.json({
        message: 'Submission approved and place created',
        placeId: placeResult.insertedId.toString(),
      });
    }

    if (action === 'reject') {
      await submissionsCollection.updateOne(
        { _id: submission._id },
        {
          $set: {
            status: 'rejected',
            'adminReview.reviewedBy': new ObjectId(session.user.id),
            'adminReview.reviewedAt': new Date(),
            'adminReview.notes': notes || '',
            updatedAt: new Date(),
          },
        }
      );

      await logActivity({
        userId: session.user.id,
        type: 'place_submission_rejected',
        entityType: 'submission',
        entityId: submissionId,
        message: `Rejected "${submission.placeData.name}"`,
        metadata: { placeName: submission.placeData.name },
      });

      return NextResponse.json({ message: 'Submission rejected' });
    }

    if (action === 'needs_more_info') {
      await submissionsCollection.updateOne(
        { _id: submission._id },
        {
          $set: {
            status: 'needs_more_info',
            'adminReview.reviewedBy': new ObjectId(session.user.id),
            'adminReview.reviewedAt': new Date(),
            'adminReview.notes': notes || '',
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ message: 'Marked as needs more info' });
    }

    if (action === 'duplicate') {
      await submissionsCollection.updateOne(
        { _id: submission._id },
        {
          $set: {
            status: 'duplicate',
            'adminReview.reviewedBy': new ObjectId(session.user.id),
            'adminReview.reviewedAt': new Date(),
            'adminReview.notes': notes || '',
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ message: 'Marked as duplicate' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/admin/place-submissions/[submissionId] error:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
