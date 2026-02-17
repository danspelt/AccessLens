import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import crypto from 'crypto';

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function sha256Base64Url(value: string) {
  return base64UrlEncode(crypto.createHash('sha256').update(value).digest());
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID is not configured' },
      { status: 500 }
    );
  }

  if (!appUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_APP_URL is not configured' },
      { status: 500 }
    );
  }

  const redirectUri = `${appUrl.replace(/\/$/, '')}/api/auth/google/callback`;

  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const session = await getSession();

  const state = base64UrlEncode(crypto.randomBytes(16));
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  const codeChallenge = sha256Base64Url(codeVerifier);

  session.oauthState = state;
  session.oauthCodeVerifier = codeVerifier;
  session.oauthRedirectTo = redirectTo;
  await session.save();

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('code_challenge', codeChallenge);
  googleAuthUrl.searchParams.set('code_challenge_method', 'S256');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(googleAuthUrl.toString());
}
