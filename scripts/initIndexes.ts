/**
 * Initialize MongoDB indexes for AccessLens
 * Run this script once after setting up the database:
 * npx tsx scripts/initIndexes.ts
 *
 * Loads `.env` then `.env.local` (like Next.js) so `MONGODB_URI` / `MONGODB_DB` are set; `tsx` does not load them by default.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { getDb } from '../src/lib/db/mongoClient';

function loadEnvFile(relativePath: string, override: boolean): void {
  const envPath = resolve(process.cwd(), relativePath);
  if (!existsSync(envPath)) {
    return;
  }
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env', false);
loadEnvFile('.env.local', true);
async function initIndexes() {
  try {
    const db = await getDb();

    // Users collection
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Created index on users.email');

    // Places collection
    const placesCollection = db.collection('places');
    await placesCollection.createIndex({ city: 1, category: 1 });
    await placesCollection.createIndex({ createdByUserId: 1 });
    await placesCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
    // Future: 2dsphere index for location-based queries
    // await placesCollection.createIndex({ location: '2dsphere' });
    console.log('✓ Created indexes on places');

    // Reviews collection
    const reviewsCollection = db.collection('reviews');
    await reviewsCollection.createIndex({ placeId: 1, createdAt: -1 });
    await reviewsCollection.createIndex({ userId: 1 });
    console.log('✓ Created indexes on reviews');

    console.log('\n✅ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

initIndexes();

