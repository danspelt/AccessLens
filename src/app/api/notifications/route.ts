import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import type { Notification } from '@/models/Notification';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const userId = new ObjectId(session.user.id);
  const collection = await getCollection<Notification>('notifications');
  const [items, unreadCount] = await Promise.all([
    collection.find({ userId }).sort({ createdAt: -1 }).limit(100).toArray(),
    collection.countDocuments({ userId, readAt: null }),
  ]);
  return NextResponse.json({ unreadCount, notifications: items.map((item) => ({
    id: item._id.toString(), title: item.title, message: item.message, href: item.href,
    read: Boolean(item.readAt), createdAt: item.createdAt.toISOString(),
  })) });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const userId = new ObjectId(session.user.id);
  const collection = await getCollection<Notification>('notifications');
  if (body.all === true) await collection.updateMany({ userId, readAt: null }, { $set: { readAt: new Date() } });
  else if (typeof body.id === 'string' && ObjectId.isValid(body.id)) await collection.updateOne({ _id: new ObjectId(body.id), userId }, { $set: { readAt: new Date() } });
  else return NextResponse.json({ error: 'Invalid notification' }, { status: 400 });
  return NextResponse.json({ success: true });
}
