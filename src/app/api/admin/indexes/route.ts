import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';
import { ReportVote } from '@/models/ReportVote';
import { PlaceSnapshot } from '@/models/PlaceSnapshot';

function parseAdminEmails(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST() {
  const session = await getSession();

  if (!session.userId || !session.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS);

  if (adminEmails.length === 0) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'ADMIN_EMAILS is not configured. Refusing to run index initializer.',
      },
      { status: 403 }
    );
  }

  if (!adminEmails.includes(session.email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const places = await getCollection<Place>('places');
  const reviews = await getCollection<Review>('reviews');
  const reportVotes = await getCollection<ReportVote>('report_votes');
  const placeSnapshots = await getCollection<PlaceSnapshot>('place_snapshots');

  await Promise.all([
    places.createIndex({ name: 'text', address: 'text', city: 'text' }, { name: 'places_text' }),
    places.createIndex({ location: '2dsphere' }, { name: 'places_location_2dsphere' }),
    places.createIndex({ city: 1 }, { name: 'places_city' }),
    places.createIndex({ category: 1 }, { name: 'places_category' }),
    reviews.createIndex({ placeId: 1, createdAt: -1 }, { name: 'reviews_place_createdAt' }),
    reviews.createIndex({ userId: 1, createdAt: -1 }, { name: 'reviews_user_createdAt' }),
    reportVotes.createIndex({ reviewId: 1, userId: 1 }, { name: 'report_votes_review_user', unique: true }),
    reportVotes.createIndex({ reviewId: 1, createdAt: -1 }, { name: 'report_votes_review_createdAt' }),
    placeSnapshots.createIndex({ placeId: 1 }, { name: 'place_snapshots_place', unique: true }),
  ]);

  return NextResponse.json({ ok: true });
}
