import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { BusinessVisit } from '@/models/BusinessVisit';
import { User } from '@/models/User';
import { canAccessStudentOutreach } from '@/lib/auth/outreachRoles';

async function gate() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, status: 401, error: 'Authentication required' };
  }
  const users = await getCollection<User>('users');
  const user = await users.findOne({ _id: new ObjectId(session.user.id) });
  if (!user || !canAccessStudentOutreach(user.role)) {
    return { ok: false as const, status: 403, error: 'Student or admin access required' };
  }
  return { ok: true as const, user };
}

export async function GET(request: NextRequest) {
  const g = await gate();
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status });

  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get('citySlug') || 'victoria-bc';
  const filter = searchParams.get('filter'); // all | unclaimed | needs_follow_up

  const placesCol = await getCollection<Place>('places');
  const visitsCol = await getCollection<BusinessVisit>('businessVisits');

  const places = await placesCol
    .find({ citySlug })
    .project({
      name: 1,
      address: 1,
      accessCode: 1,
      outreachStatus: 1,
      isClaimed: 1,
    })
    .sort({ name: 1 })
    .limit(300)
    .toArray();

  const placeIds = places.map((p) => p._id);
  const recentVisits = await visitsCol
    .find({ placeId: { $in: placeIds } })
    .sort({ visitDate: -1 })
    .toArray();

  const lastVisitByPlace = new Map<string, BusinessVisit>();
  for (const v of recentVisits) {
    const key = v.placeId.toString();
    if (!lastVisitByPlace.has(key)) lastVisitByPlace.set(key, v);
  }

  let rows = places.map((p) => {
    const id = p._id.toString();
    const last = lastVisitByPlace.get(id);
    return {
      id,
      name: p.name,
      address: p.address,
      accessCode: p.accessCode ?? null,
      outreachStatus: p.outreachStatus ?? 'unclaimed',
      isClaimed: p.isClaimed,
      lastVisit: last
        ? {
            visitType: last.visitType,
            outcome: last.outcome,
            visitDate: last.visitDate.toISOString(),
            nextFollowUpDate: last.nextFollowUpDate?.toISOString() ?? null,
          }
        : null,
    };
  });

  if (filter === 'unclaimed') {
    rows = rows.filter((r) => r.outreachStatus === 'unclaimed' || !r.isClaimed);
  } else if (filter === 'needs_follow_up') {
    const now = Date.now();
    rows = rows.filter((r) => {
      const fu = r.lastVisit?.nextFollowUpDate;
      return fu && new Date(fu).getTime() <= now;
    });
  }

  return NextResponse.json({ places: rows });
}
