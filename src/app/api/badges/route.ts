import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';
import {
  buildBadgeProgress,
  collectBadgeCounts,
  computeEarnedBadges,
} from '@/lib/badges/awardBadges';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const users = await getCollection<User>('users');
    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { badges: 1 } }
    );

    const counts = await collectBadgeCounts(userId);
    const computed = computeEarnedBadges(counts);
    const stored = user?.badges ?? [];
    const earned = [...new Set([...stored, ...computed])];
    const badges = buildBadgeProgress(counts, earned);

    return NextResponse.json({ counts, badges, earned });
  } catch (error) {
    console.error('GET /api/badges error:', error);
    return NextResponse.json({ error: 'Failed to load badges' }, { status: 500 });
  }
}
