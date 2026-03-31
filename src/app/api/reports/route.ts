import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongoClient';
import { auth } from '@/auth';
import { reportSchema } from '@/lib/validation/schemas';
import { Report } from '@/models/Report';
import { Place } from '@/models/Place';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = reportSchema.parse(body);

    // Verify the place exists
    const placesCollection = await getCollection<Place>('places');
    const place = await placesCollection.findOne({ _id: new ObjectId(validated.placeId) });
    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const reportsCollection = await getCollection<Report>('reports');

    const report: Omit<Report, '_id'> = {
      placeId: new ObjectId(validated.placeId),
      userId: new ObjectId(session.user.id),
      type: validated.type,
      description: validated.description,
      photoUrls: validated.photoUrls || [],
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reportsCollection.insertOne(report as Report);

    return NextResponse.json(
      { report: { id: result.insertedId.toString(), ...report } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');
    const status = searchParams.get('status');

    const reportsCollection = await getCollection<Report>('reports');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (placeId && ObjectId.isValid(placeId)) {
      query.placeId = new ObjectId(placeId);
    }
    if (status) query.status = status;

    const reports = await reportsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const serialized = reports.map((r) => ({
      ...r,
      _id: r._id.toString(),
      placeId: r.placeId.toString(),
      userId: r.userId.toString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({ reports: serialized });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
