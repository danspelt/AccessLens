import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { auth } from '@/auth';
import { PlaceSubmission } from '@/models/PlaceSubmission';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const usersCollection = await getCollection<User>('users');
  const user = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'submitted') as PlaceSubmission['status'];

    const collection = await getCollection<PlaceSubmission>('placeSubmissions');
    const submissions = await collection
      .find({ status })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const serialized = submissions.map((s) => ({
      ...s,
      _id: s._id.toString(),
      submittedBy: {
        ...s.submittedBy,
        userId: s.submittedBy.userId.toString(),
      },
      adminReview: {
        ...s.adminReview,
        reviewedBy: s.adminReview.reviewedBy?.toString() ?? null,
      },
      createdPlaceId: s.createdPlaceId?.toString() ?? null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json({ submissions: serialized });
  } catch (error) {
    console.error('GET /api/admin/place-submissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
