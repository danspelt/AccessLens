import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/auth/session';
import { getCollection } from '@/lib/db/mongoClient';
import { Review } from '@/models/Review';
import { ReportVote } from '@/models/ReportVote';
import { User } from '@/models/User';
import { recomputePlaceSnapshot } from '@/lib/trust/recomputePlaceSnapshot';

function repDeltaForVote(value: 1 | -1) {
  return value === 1 ? 2 : -1;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    const body = (await request.json()) as { value?: unknown };
    const valueRaw = body?.value;

    if (valueRaw !== 1 && valueRaw !== -1) {
      return NextResponse.json({ error: 'value must be 1 or -1' }, { status: 400 });
    }

    const value = valueRaw as 1 | -1;

    const reviewsCollection = await getCollection<Review>('reviews');
    const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.userId.toString() === session.userId) {
      return NextResponse.json({ error: 'You cannot vote on your own review' }, { status: 400 });
    }

    const reportVotes = await getCollection<ReportVote>('report_votes');
    const users = await getCollection<User>('users');

    const voterObjectId = new ObjectId(session.userId);

    const existingVote = await reportVotes.findOne({ reviewId: review._id, userId: voterObjectId });

    if (existingVote && existingVote.value === value) {
      return NextResponse.json({ ok: true, changed: false });
    }

    const now = new Date();

    if (!existingVote) {
      await reportVotes.insertOne({
        reviewId: review._id,
        userId: voterObjectId,
        value,
        createdAt: now,
        updatedAt: now,
      } as unknown as ReportVote);
    } else {
      await reportVotes.updateOne(
        { _id: existingVote._id },
        {
          $set: {
            value,
            updatedAt: now,
          },
        }
      );
    }

    const previousRepDelta = existingVote ? repDeltaForVote(existingVote.value) : 0;
    const nextRepDelta = repDeltaForVote(value);
    const delta = nextRepDelta - previousRepDelta;

    if (delta !== 0) {
      await users.updateOne(
        { _id: review.userId },
        {
          $inc: { repScore: delta },
          $set: { updatedAt: now },
        }
      );
    }

    await recomputePlaceSnapshot(review.placeId);

    return NextResponse.json({ ok: true, changed: true });
  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
