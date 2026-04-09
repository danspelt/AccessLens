/**
 * Initialize MongoDB indexes for AccessLens.
 * Run: npx tsx scripts/initIndexes.ts
 *
 * If places were created without GeoJSON `location`, run after indexes:
 *   npx tsx scripts/backfillPlaceLocations.ts
 */
import { getDb } from '../src/lib/db/mongoClient';

async function initIndexes() {
  try {
    const db = await getDb();

    // Users collection
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });
    console.log('✓ users.email (unique)');

    // Places collection
    const places = db.collection('places');
    await places.createIndex({ citySlug: 1, category: 1 });
    await places.createIndex({ slug: 1 });
    await places.createIndex({ createdByUserId: 1 });
    await places.createIndex({ accessibilityScore: -1 });
    await places.createIndex({ name: 'text', address: 'text', description: 'text' });
    // Geospatial index (location: GeoJSON Point)
    await places.createIndex({ location: '2dsphere' });
    console.log('✓ places indexes');

    // Reviews collection
    const reviews = db.collection('reviews');
    await reviews.createIndex({ placeId: 1, createdAt: -1 });
    await reviews.createIndex({ userId: 1 });
    console.log('✓ reviews indexes');

    // Favorites collection
    const favorites = db.collection('favorites');
    await favorites.createIndex({ userId: 1, placeId: 1 }, { unique: true });
    await favorites.createIndex({ userId: 1, createdAt: -1 });
    console.log('✓ favorites indexes');

    // Activities collection
    const activities = db.collection('activities');
    await activities.createIndex({ userId: 1, createdAt: -1 });
    console.log('✓ activities indexes');

    // Geocode cache collection (TTL)
    const geocodeCache = db.collection('geocode_cache');
    await geocodeCache.createIndex({ q: 1 }, { unique: true });
    await geocodeCache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('✓ geocode_cache indexes (unique + TTL)');

    // Reports collection
    const reports = db.collection('reports');
    await reports.createIndex({ placeId: 1, status: 1 });
    await reports.createIndex({ userId: 1 });
    await reports.createIndex({ status: 1, createdAt: -1 });
    console.log('✓ reports indexes');

    console.log('\n✅ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initIndexes();
