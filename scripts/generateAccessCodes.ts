/**
 * Assign unique 6-digit access codes to Victoria places that don't have one yet.
 * Run: npx tsx scripts/generateAccessCodes.ts
 */
import { MongoClient } from 'mongodb';
import { generateUniqueAccessCode } from '../src/lib/access/codes';
import type { Place } from '../src/models/Place';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'accesslens';

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const places = db.collection<Place>('places');

  const withoutCode = await places
    .find({ citySlug: 'victoria-bc', accessCode: { $exists: false } })
    .toArray();

  console.log(`Found ${withoutCode.length} places without access codes`);

  for (const place of withoutCode) {
    const accessCode = await generateUniqueAccessCode();
    await places.updateOne(
      { _id: place._id },
      {
        $set: {
          accessCode,
          outreachStatus: place.outreachStatus ?? 'unclaimed',
          updatedAt: new Date(),
        },
      }
    );
    console.log(`  ${place.name}: ${accessCode}`);
  }

  await client.close();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
