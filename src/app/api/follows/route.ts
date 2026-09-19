import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import type { Follow } from '@/models/Follow';
import type { Place } from '@/models/Place';

function placeIdFrom(request: NextRequest) { return request.nextUrl.searchParams.get('placeId'); }

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const placeId = placeIdFrom(request);
  if (!placeId || !ObjectId.isValid(placeId)) return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
  const follow = await (await getCollection<Follow>('follows')).findOne({ userId: new ObjectId(session.user.id), entityType: 'place', entityId: new ObjectId(placeId) });
  return NextResponse.json({ following: Boolean(follow) });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const placeId = typeof body.placeId === 'string' ? body.placeId : '';
  if (!ObjectId.isValid(placeId)) return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
  const entityId = new ObjectId(placeId);
  const place = await (await getCollection<Place>('places')).findOne({ _id: entityId }, { projection: { _id: 1 } });
  if (!place) return NextResponse.json({ error: 'Place not found' }, { status: 404 });
  await (await getCollection<Follow>('follows')).updateOne(
    { userId: new ObjectId(session.user.id), entityType: 'place', entityId },
    { $setOnInsert: { createdAt: new Date() } }, { upsert: true }
  );
  return NextResponse.json({ following: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const placeId = placeIdFrom(request);
  if (!placeId || !ObjectId.isValid(placeId)) return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
  await (await getCollection<Follow>('follows')).deleteOne({ userId: new ObjectId(session.user.id), entityType: 'place', entityId: new ObjectId(placeId) });
  return NextResponse.json({ following: false });
}
