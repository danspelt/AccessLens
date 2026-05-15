import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { BusinessVisit } from '@/models/BusinessVisit';

/** Pilot impact metrics for funders and municipalities. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const citySlug = 'victoria-bc';
  const places = await getCollection<Place>('places');
  const visits = await getCollection<BusinessVisit>('businessVisits');

  const baseFilter = { citySlug };
  const [
    totalPlaces,
    withCodes,
    unclaimed,
    claimed,
    pendingReview,
    published,
    studentVerified,
    withPhotos,
    visitCount,
    needsFollowUp,
  ] = await Promise.all([
    places.countDocuments(baseFilter),
    places.countDocuments({ ...baseFilter, accessCode: { $exists: true } }),
    places.countDocuments({ ...baseFilter, outreachStatus: 'unclaimed' }),
    places.countDocuments({ ...baseFilter, outreachStatus: 'claimed' }),
    places.countDocuments({ ...baseFilter, outreachStatus: 'pending_review' }),
    places.countDocuments({ ...baseFilter, outreachStatus: 'published' }),
    places.countDocuments({ ...baseFilter, verificationLevel: 'student_verified' }),
    places.countDocuments({ ...baseFilter, 'photoUrls.0': { $exists: true } }),
    visits.countDocuments({}),
    visits.countDocuments({ nextFollowUpDate: { $gte: new Date() } }),
  ]);

  return NextResponse.json({
    citySlug,
    metrics: {
      businessesIdentified: totalPlaces,
      businessesWithAccessCodes: withCodes,
      businessesUnclaimed: unclaimed,
      businessesClaimed: claimed,
      businessesPendingReview: pendingReview,
      businessesPublished: published,
      businessesStudentVerified: studentVerified,
      businessesWithPhotos: withPhotos,
      outreachVisitsLogged: visitCount,
      followUpsScheduled: needsFollowUp,
      claimRate: withCodes > 0 ? Math.round(((claimed + pendingReview + published) / withCodes) * 100) : 0,
      publishRate: withCodes > 0 ? Math.round((published / withCodes) * 100) : 0,
    },
  });
}
