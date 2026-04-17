import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import type { City } from '@/models/City';
import type { User } from '@/models/User';

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

const upsertSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  name: z.string().min(1),
  province: z.string().min(1),
  country: z.string().min(1),
  description: z.string().min(1),
  heroImageUrl: z.string().url().optional(),
  order: z.number().int().nonnegative().default(100),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const collection = await getCollection<City>('cities');
  const cities = await collection.find({}).sort({ order: 1, name: 1 }).toArray();
  return NextResponse.json({
    cities: cities.map((c) => ({
      id: c._id.toString(),
      slug: c.slug,
      name: c.name,
      province: c.province,
      country: c.country,
      description: c.description,
      heroImageUrl: c.heroImageUrl,
      order: c.order,
      isActive: c.isActive,
      createdAt: c.createdAt?.toISOString?.() ?? null,
      updatedAt: c.updatedAt?.toISOString?.() ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if ('error' in admin) return admin.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const collection = await getCollection<City>('cities');
  const now = new Date();
  await collection.updateOne(
    { slug: parsed.data.slug },
    {
      $set: {
        name: parsed.data.name,
        province: parsed.data.province,
        country: parsed.data.country,
        description: parsed.data.description,
        heroImageUrl: parsed.data.heroImageUrl,
        order: parsed.data.order,
        isActive: parsed.data.isActive,
        updatedAt: now,
      },
      $setOnInsert: { slug: parsed.data.slug, createdAt: now },
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
