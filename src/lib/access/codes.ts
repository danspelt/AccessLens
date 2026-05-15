import { getCollection } from '@/lib/db/mongoClient';
import { Place } from '@/models/Place';
import { generateAccessCode } from '@/lib/access/codeFormat';

export { generateAccessCode, normalizeAccessCode, isValidAccessCodeFormat } from '@/lib/access/codeFormat';

export async function generateUniqueAccessCode(maxAttempts = 25): Promise<string> {
  const places = await getCollection<Place>('places');
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateAccessCode();
    const existing = await places.findOne({ accessCode: code }, { projection: { _id: 1 } });
    if (!existing) return code;
  }
  throw new Error('Unable to generate a unique access code');
}
