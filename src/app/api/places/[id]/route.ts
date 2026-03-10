import { NextRequest, NextResponse } from 'next/server';
import { getPlaceById, serializePlace } from '@/lib/accesslens/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const place = await getPlaceById(id);

    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: id.length === 24 ? 404 : 400 }
      );
    }

    return NextResponse.json({ place: serializePlace(place) });
  } catch (error) {
    console.error('Error fetching place:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

