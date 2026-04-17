/**
 * Initialize MongoDB indexes for AccessLens.
 * Run: npx tsx scripts/initIndexes.ts
 *
 * If places were created without GeoJSON `location`, run after indexes:
 *   npx tsx scripts/backfillPlaceLocations.ts
 */
import { Collection, IndexSpecification, CreateIndexesOptions, MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'accesslens';

async function safeIndex(
  collection: Collection,
  spec: IndexSpecification,
  options?: CreateIndexesOptions
) {
  try {
    await collection.createIndex(spec, options);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`  ! index on ${collection.collectionName} skipped: ${message}`);
  }
}

async function initIndexes() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);

    // Users collection
    const users = db.collection('users');
    await safeIndex(users, { email: 1 }, { unique: true });
    console.log('✓ users.email (unique)');

    // Places collection
    const places = db.collection('places');
    await safeIndex(places, { citySlug: 1, category: 1 });
    await safeIndex(places, { slug: 1 });
    await safeIndex(places, { createdByUserId: 1 });
    await safeIndex(places, { accessibilityScore: -1 });
    await safeIndex(places, { name: 'text', address: 'text', description: 'text' });
    // Geospatial index (location: GeoJSON Point)
    await safeIndex(places, { location: '2dsphere' });
    console.log('✓ places indexes');

    // Reviews collection
    const reviews = db.collection('reviews');
    await safeIndex(reviews, { placeId: 1, createdAt: -1 });
    await safeIndex(reviews, { userId: 1 });
    console.log('✓ reviews indexes');

    // Favorites collection
    const favorites = db.collection('favorites');
    await safeIndex(favorites, { userId: 1, placeId: 1 }, { unique: true });
    await safeIndex(favorites, { userId: 1, createdAt: -1 });
    console.log('✓ favorites indexes');

    // Activities collection
    const activities = db.collection('activities');
    await safeIndex(activities, { userId: 1, createdAt: -1 });
    console.log('✓ activities indexes');

    // Geocode cache collection (TTL)
    const geocodeCache = db.collection('geocode_cache');
    await safeIndex(geocodeCache, { q: 1 }, { unique: true });
    await safeIndex(geocodeCache, { expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('✓ geocode_cache indexes (unique + TTL)');

    // Reports collection
    const reports = db.collection('reports');
    await safeIndex(reports, { placeId: 1, status: 1 });
    await safeIndex(reports, { userId: 1 });
    await safeIndex(reports, { status: 1, createdAt: -1 });
    console.log('✓ reports indexes');

    // Cities collection
    const cities = db.collection('cities');
    await safeIndex(cities, { slug: 1 }, { unique: true });
    await safeIndex(cities, { isActive: 1, order: 1 });
    console.log('✓ cities indexes');

    // Site content collection
    const siteContent = db.collection('site_content');
    await safeIndex(siteContent, { key: 1 }, { unique: true });
    console.log('✓ site_content indexes');

    console.log('\n✅ All indexes created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

initIndexes();
