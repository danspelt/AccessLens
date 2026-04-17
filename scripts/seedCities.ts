/**
 * Seed script: populate the `cities` collection.
 * Idempotent: upserts by slug.
 * Run: npx tsx scripts/seedCities.ts
 */
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'accesslens';

type CitySeed = {
  slug: string;
  name: string;
  province: string;
  country: string;
  description: string;
  heroImageUrl?: string;
  order: number;
  isActive: boolean;
};

const cities: CitySeed[] = [
  {
    slug: 'victoria-bc',
    name: 'Victoria',
    province: 'BC',
    country: 'Canada',
    description:
      'The capital city of British Columbia, home to beautiful parks, historic buildings, and a vibrant downtown core.',
    order: 1,
    isActive: true,
  },
];

async function seedCities() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('cities');

    await collection.createIndex({ slug: 1 }, { unique: true });

    const now = new Date();
    let created = 0;
    let updated = 0;

    for (const city of cities) {
      const res = await collection.updateOne(
        { slug: city.slug },
        {
          $set: {
            name: city.name,
            province: city.province,
            country: city.country,
            description: city.description,
            heroImageUrl: city.heroImageUrl,
            order: city.order,
            isActive: city.isActive,
            updatedAt: now,
          },
          $setOnInsert: { slug: city.slug, createdAt: now },
        },
        { upsert: true }
      );
      if (res.upsertedCount > 0) created++;
      else if (res.modifiedCount > 0) updated++;
    }

    console.log(`✓ cities: ${created} created, ${updated} updated (of ${cities.length})`);
    console.log('\n✅ City seed complete.');
  } catch (err) {
    console.error('❌ Error seeding cities:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedCities();
