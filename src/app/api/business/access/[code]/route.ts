import { NextRequest, NextResponse } from 'next/server';
import { findPlaceByAccessCode, serializePlaceForBusiness } from '@/lib/db/placesByAccessCode';

interface RouteContext {
  params: Promise<{ code: string }>;
}

/** Public lookup: validate six-digit code and return business summary (no auth). */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { code } = await context.params;
  const place = await findPlaceByAccessCode(code);

  if (!place) {
    return NextResponse.json(
      { error: 'Invalid or expired access code. Check the card we left or contact support.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ place: serializePlaceForBusiness(place) });
}
