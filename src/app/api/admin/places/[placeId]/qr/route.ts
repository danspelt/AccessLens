import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import QRCode from 'qrcode';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';

interface RouteContext {
  params: Promise<{ placeId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { placeId } = await context.params;
  if (!ObjectId.isValid(placeId)) {
    return NextResponse.json({ error: 'Invalid place ID' }, { status: 400 });
  }

  const places = await getCollection<Place>('places');
  const place = await places.findOne({ _id: new ObjectId(placeId) });
  if (!place?.accessCode) {
    return NextResponse.json({ error: 'Generate an access code for this place first' }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const updateUrl = `${origin}/update-accessibility/${place.accessCode}`;

  const png = await QRCode.toBuffer(updateUrl, {
    type: 'png',
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
  });

  const filename = `${place.slug || place.name}-accesslens-qr.png`.replace(/[^a-z0-9.-]+/gi, '-');

  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
