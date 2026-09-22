import { NextRequest, NextResponse } from 'next/server';
import { findPlaceByAccessCode, serializePlaceForBusiness } from '@/lib/db/placesByAccessCode';
import { setBusinessAccessSession } from '@/lib/business/session';
import { clientIp, rateLimit } from '@/lib/rateLimit';

interface RouteContext {
  params: Promise<{ code: string }>;
}

/** Confirm code and start a short-lived business update session (no account required). */
export async function POST(request: NextRequest, context: RouteContext) {
  if (!rateLimit(`bizverify:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: 429 }
    );
  }
  const { code } = await context.params;
  const place = await findPlaceByAccessCode(code);

  if (!place) {
    return NextResponse.json({ error: 'Invalid or expired access code' }, { status: 404 });
  }

  await setBusinessAccessSession(place._id.toString(), code);

  return NextResponse.json({
    place: serializePlaceForBusiness(place),
    sessionStarted: true,
  });
}
