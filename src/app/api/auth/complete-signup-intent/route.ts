import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import { completeSignupIntentSchema } from '@/lib/validation/schemas';
import type { User } from '@/models/User';
import { ObjectId } from 'mongodb';

/**
 * One-time: OAuth users without accountType set their reviewer vs business path.
 * Rejects if accountType is already stored (prevents upgrading to business for free).
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { accountType } = completeSignupIntentSchema.parse(body);

    const users = await getCollection<User>('users');
    const user = await users.findOne({ _id: new ObjectId(session.user.id) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.passwordHash) {
      return NextResponse.json(
        { error: 'This step is only for social or magic-link sign-in. Your account type was set at registration.' },
        { status: 403 }
      );
    }

    if (user.accountType != null) {
      return NextResponse.json(
        { error: 'Account type is already set for this account' },
        { status: 403 }
      );
    }

    const businessSubscriptionStatus = accountType === 'business' ? 'pending' : 'none';

    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          accountType,
          businessSubscriptionStatus,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ ok: true, accountType, businessSubscriptionStatus });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('POST /api/auth/complete-signup-intent error:', error);
    return NextResponse.json({ error: 'Failed to complete signup' }, { status: 500 });
  }
}
