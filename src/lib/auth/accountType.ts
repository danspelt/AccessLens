import type { Session } from 'next-auth';
import type { AccountType, User } from '@/models/User';
import { NextResponse } from 'next/server';

export function resolvedAccountType(userOrType: User | AccountType | undefined | null): AccountType {
  if (userOrType == null) return 'reviewer';
  if (typeof userOrType === 'string') return userOrType;
  return userOrType.accountType ?? 'reviewer';
}

/** Reviewers can submit reviews and accessibility reports; business accounts cannot. */
export function canSubmitCommunityFeedback(accountType: AccountType | undefined | null): boolean {
  return resolvedAccountType(accountType) !== 'business';
}

/**
 * For API routes: returns a NextResponse to send, or null if the caller may proceed.
 */
export function communityFeedbackGuard(session: Session | null): NextResponse | null {
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const at = session.user.accountType ?? 'reviewer';
  if (at === 'business') {
    return NextResponse.json(
      { error: 'Business accounts cannot submit reviews or accessibility reports.' },
      { status: 403 }
    );
  }
  return null;
}
