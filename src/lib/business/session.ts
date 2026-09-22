import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface BusinessAccessSessionData {
  placeId?: string;
  accessCode?: string;
  verifiedAt?: number;
}

export type BusinessAccessSession = IronSession<BusinessAccessSessionData>;

function resolveSessionPassword(): string {
  const secret =
    process.env.BUSINESS_SESSION_SECRET || process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'BUSINESS_SESSION_SECRET (32+ chars) must be configured in production'
    );
  }
  return 'dev-only-insecure-secret-not-for-production';
}

export async function getBusinessAccessSession(): Promise<BusinessAccessSession> {
  const cookieStore = await cookies();
  return getIronSession<BusinessAccessSessionData>(cookieStore, {
    cookieName: 'accesslens_business_access',
    password: resolveSessionPassword(),
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax' as const,
    },
  });
}

export async function setBusinessAccessSession(placeId: string, accessCode: string): Promise<void> {
  const session = await getBusinessAccessSession();
  session.placeId = placeId;
  session.accessCode = accessCode;
  session.verifiedAt = Date.now();
  await session.save();
}

export async function clearBusinessAccessSession(): Promise<void> {
  const session = await getBusinessAccessSession();
  session.destroy();
}

export async function requireBusinessAccessForPlace(
  placeId: string
): Promise<BusinessAccessSession | null> {
  const session = await getBusinessAccessSession();
  if (session.placeId !== placeId || !session.accessCode) return null;
  return session;
}
