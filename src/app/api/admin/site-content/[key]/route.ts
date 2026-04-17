import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import type { SiteContent, SiteContentKey } from '@/models/SiteContent';
import type { User } from '@/models/User';

const KNOWN_KEYS: SiteContentKey[] = [
  'home.hero',
  'home.trustStrip',
  'home.features',
  'home.values',
  'home.howItWorks',
  'home.sampleChecklist',
  'home.cta',
  'home.testimonial',
];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) } as const;
  }
  const users = await getCollection<User>('users');
  const user = await users.findOne({ _id: new ObjectId(session.user.id) });
  if (!user || user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) } as const;
  }
  return { user } as const;
}

function normalizeKey(raw: string): SiteContentKey | null {
  return (KNOWN_KEYS as string[]).includes(raw) ? (raw as SiteContentKey) : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key: rawKey } = await params;
  const key = normalizeKey(rawKey);
  if (!key) return NextResponse.json({ error: 'Unknown content key' }, { status: 400 });

  const collection = await getCollection<SiteContent>('site_content');
  const doc = await collection.findOne({ key });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    key: doc.key,
    version: doc.version,
    data: doc.data,
    updatedAt: doc.updatedAt.toISOString(),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  const { key: rawKey } = await params;
  const key = normalizeKey(rawKey);
  if (!key) return NextResponse.json({ error: 'Unknown content key' }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || !('data' in body)) {
    return NextResponse.json({ error: 'Body must include { data }' }, { status: 400 });
  }

  const collection = await getCollection<SiteContent>('site_content');
  const now = new Date();
  await collection.updateOne(
    { key },
    {
      $set: {
        key,
        version: 1,
        data: (body as { data: unknown }).data,
        updatedAt: now,
        updatedBy: new ObjectId(admin.user._id),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
