import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { hashPassword } from '@/lib/auth/authHelpers';
import { signupSchema } from '@/lib/validation/schemas';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    const usersCollection = await getCollection<User>('users');

    const existing = await usersCollection.findOne({ email: validated.email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(validated.password);

    const user: Omit<User, '_id'> = {
      email: validated.email.toLowerCase(),
      passwordHash,
      name: validated.name,
      role: 'user',
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(user as User);

    return NextResponse.json(
      { user: { id: result.insertedId.toString(), email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    console.error('POST /api/auth/signup error:', error);
    return NextResponse.json({ error: 'Sign up failed' }, { status: 500 });
  }
}
