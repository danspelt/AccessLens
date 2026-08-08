import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { Review } from '@/models/Review';
import { scheduleBadgeEvaluation } from '@/lib/badges/awardBadges';
import { logActivity } from '@/lib/db/activity';

const actionSchema = z.object({
  action: z.enum(['verify', 'unverify']),
});

interface RouteContext {
  params: Promise<{ reviewId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { reviewId } = await context.params;
  if (!ObjectId.isValid(reviewId)) {
    return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
  }

  try {
    const { action } = actionSchema.parse(await request.json());
    const now = new Date();
    const reviews = await getCollection<Review>('reviews');
    const review = await reviews.findOne({ _id: new ObjectId(reviewId) });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (action === 'verify') {
      await reviews.updateOne(
        { _id: review._id },
        {
          $set: {
            adminVerified: true,
            verifiedBy: admin.user._id,
            verifiedAt: now,
            updatedAt: now,
          },
        }
      );
      await logActivity({
        userId: admin.user._id.toString(),
        type: 'review_verified',
        entityType: 'review',
        entityId: reviewId,
        message: 'Verified a community review',
        metadata: { placeId: review.placeId.toString(), authorId: review.userId.toString() },
      });
      scheduleBadgeEvaluation(review.userId.toString());
    } else {
      await reviews.updateOne(
        { _id: review._id },
        {
          $set: {
            adminVerified: false,
            verifiedBy: null,
            verifiedAt: null,
            updatedAt: now,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      adminVerified: action === 'verify',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    console.error('POST /api/admin/reviews/[reviewId] error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
