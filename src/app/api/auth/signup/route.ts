import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validation/schemas';
import { getCollection } from '@/lib/db/mongoClient';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth/authHelpers';
import { createSession } from '@/lib/auth/session';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    const usersCollection = await getCollection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: validated.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create user
    const newUser: Omit<User, '_id'> = {
      email: validated.email,
      passwordHash,
      name: validated.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser as User);
    const userId = result.insertedId.toString();

    // Create session
    await createSession(userId, validated.email);

    // Return user (without password)
    return NextResponse.json(
      {
        user: {
          id: userId,
          email: validated.email,
          name: validated.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.message },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

