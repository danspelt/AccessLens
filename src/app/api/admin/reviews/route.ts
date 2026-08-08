import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { Review } from '@/models/Review';
import { User } from '@/models/User';
import { Place } from '@/models/Place';
import { ObjectId } from 'mongodb';

/** List recent reviews for moderator verification. */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('verified'); // 'true' | 'false' | omit
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const query: Record<string, unknown> = {};
    if (filter === 'true') query.adminVerified = true;
    if (filter === 'false') {
      query.$or = [{ adminVerified: { $ne: true } }, { adminVerified: { $exists: false } }];
    }

    const reviewsCol = await getCollection<Review>('reviews');
    const reviews = await reviewsCol.find(query).sort({ createdAt: -1 }).limit(limit).toArray();

    const userIds = [...new Set(reviews.map((r) => r.userId.toString()))];
    const placeIds = [...new Set(reviews.map((r) => r.placeId.toString()))];

    const usersCol = await getCollection<User>('users');
    const placesCol = await getCollection<Place>('places');

    const [users, places] = await Promise.all([
      usersCol
        .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
        .project({ name: 1, email: 1 })
        .toArray(),
      placesCol
        .find({ _id: { $in: placeIds.map((id) => new ObjectId(id)) } })
        .project({ name: 1 })
        .toArray(),
    ]);

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const placeMap = new Map(places.map((p) => [p._id.toString(), p.name]));

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r._id.toString(),
        placeId: r.placeId.toString(),
        placeName: placeMap.get(r.placeId.toString()) || 'Unknown place',
        userId: r.userId.toString(),
        authorName: userMap.get(r.userId.toString())?.name || 'Anonymous',
        authorEmail: userMap.get(r.userId.toString())?.email,
        rating: r.rating,
        comment: r.comment,
        adminVerified: !!r.adminVerified,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('GET /api/admin/reviews error:', error);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}
