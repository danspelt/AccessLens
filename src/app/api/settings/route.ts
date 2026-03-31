import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { logActivity } from '@/lib/db/activity';

const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  accentColor: z.string().min(1).max(32),
  fontScale: z.enum(['sm', 'md', 'lg']),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const users = await getCollection<User>('users');
  const user = await users.findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { theme: 1, accentColor: 1, fontScale: 1 } }
  );

  return NextResponse.json({
    theme: user?.theme || 'system',
    accentColor: user?.accentColor || '#0284c7',
    fontScale: user?.fontScale || 'md',
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = settingsSchema.parse(body);

    const users = await getCollection<User>('users');
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { ...parsed, updatedAt: new Date() } }
    );

    await logActivity({
      userId: session.user.id,
      type: 'settings_updated',
      entityType: 'user',
      entityId: session.user.id,
      message: 'Updated dashboard settings',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }
    console.error('POST /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

