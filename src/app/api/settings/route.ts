import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { logActivity } from '@/lib/db/activity';

const DEFAULT_SETTINGS = {
  theme: 'system' as const,
  accentColor: '#0284c7',
  fontScale: 'md' as const,
  highContrast: false,
  reduceMotion: false,
  dyslexiaFont: false,
  contentDensity: 'comfortable' as const,
  lineHeight: 'normal' as const,
  units: 'metric' as const,
  mapAutoLoad: true,
  profileVisibility: 'public' as const,
  emailNotifications: false,
};

const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  accentColor: z.string().min(1).max(32),
  fontScale: z.enum(['sm', 'md', 'lg']),
  highContrast: z.boolean().optional(),
  reduceMotion: z.boolean().optional(),
  dyslexiaFont: z.boolean().optional(),
  contentDensity: z.enum(['comfortable', 'compact']).optional(),
  lineHeight: z.enum(['compact', 'normal', 'comfortable']).optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  mapAutoLoad: z.boolean().optional(),
  profileVisibility: z.enum(['public', 'private']).optional(),
  emailNotifications: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const users = await getCollection<User>('users');
  const user = await users.findOne(
    { _id: new ObjectId(session.user.id) },
    {
      projection: {
        theme: 1,
        accentColor: 1,
        fontScale: 1,
        highContrast: 1,
        reduceMotion: 1,
        dyslexiaFont: 1,
        contentDensity: 1,
        lineHeight: 1,
        units: 1,
        mapAutoLoad: 1,
        profileVisibility: 1,
        emailNotifications: 1,
      },
    }
  );

  return NextResponse.json({
    theme: user?.theme ?? DEFAULT_SETTINGS.theme,
    accentColor: user?.accentColor ?? DEFAULT_SETTINGS.accentColor,
    fontScale: user?.fontScale ?? DEFAULT_SETTINGS.fontScale,
    highContrast: user?.highContrast ?? DEFAULT_SETTINGS.highContrast,
    reduceMotion: user?.reduceMotion ?? DEFAULT_SETTINGS.reduceMotion,
    dyslexiaFont: user?.dyslexiaFont ?? DEFAULT_SETTINGS.dyslexiaFont,
    contentDensity: user?.contentDensity ?? DEFAULT_SETTINGS.contentDensity,
    lineHeight: user?.lineHeight ?? DEFAULT_SETTINGS.lineHeight,
    units: user?.units ?? DEFAULT_SETTINGS.units,
    mapAutoLoad: user?.mapAutoLoad ?? DEFAULT_SETTINGS.mapAutoLoad,
    profileVisibility: user?.profileVisibility ?? DEFAULT_SETTINGS.profileVisibility,
    emailNotifications: user?.emailNotifications ?? DEFAULT_SETTINGS.emailNotifications,
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
    const normalized = {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { ...normalized, updatedAt: new Date() } }
    );

    await logActivity({
      userId: session.user.id,
      type: 'settings_updated',
      entityType: 'user',
      entityId: session.user.id,
      message: 'Updated dashboard settings',
      metadata: {
        theme: normalized.theme,
        accentColor: normalized.accentColor,
        fontScale: normalized.fontScale,
        highContrast: normalized.highContrast,
        reduceMotion: normalized.reduceMotion,
        dyslexiaFont: normalized.dyslexiaFont,
        contentDensity: normalized.contentDensity,
        lineHeight: normalized.lineHeight,
        units: normalized.units,
        mapAutoLoad: normalized.mapAutoLoad,
        profileVisibility: normalized.profileVisibility,
        emailNotifications: normalized.emailNotifications,
      },
    });

    return NextResponse.json({ success: true, settings: normalized });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }
    console.error('POST /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

