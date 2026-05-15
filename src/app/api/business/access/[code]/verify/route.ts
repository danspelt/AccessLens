import { NextRequest, NextResponse } from 'next/server';
import { findPlaceByAccessCode, serializePlaceForBusiness } from '@/lib/db/placesByAccessCode';
import { setBusinessAccessSession } from '@/lib/business/session';

interface RouteContext {
  params: Promise<{ code: string }>;
}

/** Confirm code and start a short-lived business update session (no account required). */
export async function POST(_request: NextRequest, context: RouteContext) {
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
