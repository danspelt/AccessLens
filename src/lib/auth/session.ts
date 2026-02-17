import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  email?: string;
  oauthState?: string;
  oauthCodeVerifier?: string;
  oauthRedirectTo?: string;
}

export type AppSession = IronSession<SessionData>;

const sessionOptions = {
  cookieName: process.env.SESSION_COOKIE_NAME || 'accesslens_session',
  password: process.env.SESSION_SECRET || 'default-secret-change-in-production-min-32-chars',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax' as const,
  },
};

/**
 * Get the current session
 */
export async function getSession(): Promise<AppSession> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string, email: string): Promise<AppSession> {
  const session = await getSession();
  session.userId = userId;
  session.email = email;
  await session.save();
  return session;
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

