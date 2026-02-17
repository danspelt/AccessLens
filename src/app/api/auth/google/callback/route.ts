import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession } from '@/lib/auth/session';
import { getCollection } from '@/lib/db/mongoClient';
import { User } from '@/models/User';

type GoogleTokenResponse = {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured (missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)' },
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

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent('Missing code or state')}`);
  }

  const session = await getSession();

  if (!session.oauthState || session.oauthState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent('Invalid OAuth state')}`);
  }

  if (!session.oauthCodeVerifier) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent('Missing PKCE verifier')}`);
  }

  const codeVerifier = session.oauthCodeVerifier;
  const rawRedirectTo = session.oauthRedirectTo || '/dashboard';
  const redirectTo = rawRedirectTo.startsWith('/') ? rawRedirectTo : '/dashboard';

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    const details = await tokenRes.text();
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent('Google token exchange failed')}&details=${encodeURIComponent(details)}`
    );
  }

  const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;

  // Clear OAuth temp values once we no longer need them
  session.oauthState = undefined;
  session.oauthCodeVerifier = undefined;
  session.oauthRedirectTo = undefined;
  await session.save();

  const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });

  if (!userInfoRes.ok) {
    const details = await userInfoRes.text();
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent('Failed to fetch Google profile')}&details=${encodeURIComponent(details)}`
    );
  }

  const profile = (await userInfoRes.json()) as GoogleUserInfo;

  const usersCollection = await getCollection<User>('users');

  const existingBySub = await usersCollection.findOne({ googleSub: profile.sub });
  const existingByEmail = existingBySub
    ? null
    : await usersCollection.findOne({ email: profile.email });

  const now = new Date();

  if (existingBySub) {
    await usersCollection.updateOne(
      { _id: existingBySub._id },
      {
        $set: {
          email: profile.email,
          name: profile.name || existingBySub.name,
          updatedAt: now,
        },
      }
    );

    await createSession(existingBySub._id.toString(), profile.email);
    return NextResponse.redirect(`${appUrl}${redirectTo}`);
  }

  if (existingByEmail) {
    await usersCollection.updateOne(
      { _id: existingByEmail._id },
      {
        $set: {
          googleSub: profile.sub,
          name: profile.name || existingByEmail.name,
          updatedAt: now,
        },
      }
    );

    await createSession(existingByEmail._id.toString(), existingByEmail.email);
    return NextResponse.redirect(`${appUrl}${redirectTo}`);
  }

  const newUser: Omit<User, '_id'> = {
    email: profile.email,
    name: profile.name || profile.email.split('@')[0] || 'User',
    googleSub: profile.sub,
    repScore: 0,
    createdAt: now,
    updatedAt: now,
  };

  const insertResult = await usersCollection.insertOne(newUser as User);
  await createSession(insertResult.insertedId.toString(), profile.email);

  return NextResponse.redirect(`${appUrl}${redirectTo}`);
}
