import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import { businessVisitSchema } from '@/lib/validation/schemas';
import { BusinessVisit } from '@/models/BusinessVisit';
import { User } from '@/models/User';
import { Place } from '@/models/Place';
import { canAccessStudentOutreach } from '@/lib/auth/outreachRoles';

async function requireStudentOrAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, status: 401, error: 'Authentication required' };
  }

  const users = await getCollection<User>('users');
  const user = await users.findOne({ _id: new ObjectId(session.user.id) });
  if (!user) {
    return { ok: false as const, status: 401, error: 'User not found' };
  }

  if (!canAccessStudentOutreach(user.role)) {
    return { ok: false as const, status: 403, error: 'Student or admin access required' };
  }

  return { ok: true as const, user, session };
}

export async function GET(request: NextRequest) {
  const gate = await requireStudentOrAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  const filter: Record<string, unknown> = {};

  if (gate.user.role !== 'admin') {
    filter.studentUserId = gate.user._id;
  }
  if (placeId && ObjectId.isValid(placeId)) {
    filter.placeId = new ObjectId(placeId);
  }

  const visits = await getCollection<BusinessVisit>('businessVisits');
  const rows = await visits.find(filter).sort({ visitDate: -1 }).limit(200).toArray();

  const placeIds = [...new Set(rows.map((v) => v.placeId.toString()))];
  const placesCol = await getCollection<Place>('places');
  const places =
    placeIds.length > 0
      ? await placesCol
          .find({ _id: { $in: placeIds.map((id) => new ObjectId(id)) } })
          .project({ name: 1, address: 1 })
          .toArray()
      : [];
  const placeMap = new Map(places.map((p) => [p._id.toString(), p]));

  return NextResponse.json({
    visits: rows.map((v) => ({
      id: v._id.toString(),
      placeId: v.placeId.toString(),
      placeName: placeMap.get(v.placeId.toString())?.name ?? 'Unknown',
      placeAddress: placeMap.get(v.placeId.toString())?.address ?? '',
      visitType: v.visitType,
      visitDate: v.visitDate.toISOString(),
      outcome: v.outcome,
      contactName: v.contactName,
      interestLevel: v.interestLevel,
      notes: v.notes,
      nextFollowUpDate: v.nextFollowUpDate?.toISOString() ?? null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const gate = await requireStudentOrAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  try {
    const body = await request.json();
    const validated = businessVisitSchema.parse(body);

    if (!ObjectId.isValid(validated.placeId)) {
      return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
    }

    const places = await getCollection<Place>('places');
    const place = await places.findOne({ _id: new ObjectId(validated.placeId) });
    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const now = new Date();
    const visit: Omit<BusinessVisit, '_id'> = {
      placeId: new ObjectId(validated.placeId),
      studentUserId: gate.user._id,
      visitType: validated.visitType,
      visitDate: new Date(validated.visitDate),
      outcome: validated.outcome,
      contactName: validated.contactName,
      interestLevel: validated.interestLevel,
      notes: validated.notes,
      nextFollowUpDate: validated.nextFollowUpDate
        ? new Date(validated.nextFollowUpDate)
        : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const visits = await getCollection<BusinessVisit>('businessVisits');
    const result = await visits.insertOne(visit as BusinessVisit);

    return NextResponse.json({ visitId: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 });
    }
    console.error('POST /api/student/visits error:', error);
    return NextResponse.json({ error: 'Failed to log visit' }, { status: 500 });
  }
}
