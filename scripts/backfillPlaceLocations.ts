/**
 * Backfill GeoJSON `location` from `latitude` / `longitude` for places missing `location`.
 * Required for $near queries (QR pages, GET /api/places/nearby).
 *
 * Run: npx tsx scripts/backfillPlaceLocations.ts
 *
 * Ensure 2dsphere index exists: npx tsx scripts/initIndexes.ts
 */
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'accesslens';

async function backfill() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const places = client.db(MONGODB_DB).collection('places');

    const cursor = places.find({
      $and: [
        {
          $or: [{ location: { $exists: false } }, { location: null }],
        },
        { latitude: { $exists: true, $ne: null } },
        { longitude: { $exists: true, $ne: null } },
      ],
    });

    let updated = 0;
    let skipped = 0;

    for await (const doc of cursor) {
      const lat = doc.latitude;
      const lon = doc.longitude;
      if (
        typeof lat !== 'number' ||
        typeof lon !== 'number' ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
      ) {
        skipped++;
        continue;
      }

      const result = await places.updateOne(
        { _id: doc._id },
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [lon, lat],
            },
            updatedAt: new Date(),
          },
        }
      );
      if (result.modifiedCount > 0) updated++;
    }

    console.log(`\n✅ Backfill complete`);
    console.log(`   Updated: ${updated} place(s)`);
    if (skipped > 0) {
      console.log(`   Skipped (invalid lat/lon): ${skipped}`);
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

backfill();
