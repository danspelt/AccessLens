import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { PlacePhoto } from '@/models/PlacePhoto';
import { PlaceSubmission } from '@/models/PlaceSubmission';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';
import { Report } from '@/models/Report';

/** Pending moderation counts for the admin hub. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const [photos, placeSubmissions, outreach, unverifiedReviews, reports] = await Promise.all([
      getCollection<PlacePhoto>('placePhotos').then((c) =>
        c.countDocuments({ status: 'pending' })
      ),
      getCollection<PlaceSubmission>('placeSubmissions').then((c) =>
        c.countDocuments({ status: { $in: ['submitted', 'under_review'] } })
      ),
      getCollection<Place>('places').then((c) =>
        c.countDocuments({ outreachStatus: 'pending_review' })
      ),
      getCollection<Review>('reviews').then((c) =>
        c.countDocuments({
          $or: [{ adminVerified: { $ne: true } }, { adminVerified: { $exists: false } }],
        })
      ),
      getCollection<Report>('reports').then((c) =>
        c.countDocuments({ status: { $in: ['open', 'in_progress'] } })
      ),
    ]);

    const pending = { photos, placeSubmissions, outreach, unverifiedReviews, reports };
    const actionable = photos + placeSubmissions + outreach + reports;

    return NextResponse.json({ pending, actionable });
  } catch (error) {
    console.error('GET /api/admin/moderation-summary error:', error);
    return NextResponse.json({ error: 'Failed to load summary' }, { status: 500 });
  }
}
