/**
 * Initialize MongoDB indexes for AccessLens
 * Run this script once after setting up the database:
 * npx tsx scripts/initIndexes.ts
 */

import { getDb } from '../src/lib/db/mongoClient';

async function initIndexes() {
  try {
    const db = await getDb();

    // Users collection
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ Created index on users.email');

    // Places collection
    const placesCollection = db.collection('places');
    await placesCollection.createIndex({ citySlug: 1, category: 1, slug: 1 }, { unique: true });
    await placesCollection.createIndex({ citySlug: 1, category: 1 });
    await placesCollection.createIndex({ createdByUserId: 1 });
    await placesCollection.createIndex({ name: 'text', address: 'text', city: 'text' });
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

