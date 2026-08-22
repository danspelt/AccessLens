/**
 * Creates local candidates from a bounded official City dataset. It never
 * connects to MongoDB or publishes places.
 * Dry run: npm run import:victoria-parking
 * Write snapshot: npm run import:victoria-parking -- --write
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { toVictoriaParkingCandidate, VICTORIA_ACCESSIBLE_PARKING, type VictoriaParkingFeature } from '../src/lib/imports/victoriaAccessibleParking';

const outputPath = path.join(process.cwd(), 'data', 'victoria-accessible-parking.candidates.json');

async function main() {
  const response = await fetch(VICTORIA_ACCESSIBLE_PARKING.queryUrl, { headers: { Accept: 'application/geo+json, application/json' } });
  if (!response.ok) throw new Error(`City dataset request failed: ${response.status}`);
  const collection = (await response.json()) as { features?: VictoriaParkingFeature[] };
  const importedAt = new Date().toISOString();
  const features = collection.features ?? [];
  if (features.length === 0 || features.length > 5) throw new Error(`Expected 1–5 bounded records; received ${features.length}.`);
  for (const feature of features) {
    const coordinates = feature.geometry?.coordinates;
    if (!Number.isFinite(coordinates?.[0]) || !Number.isFinite(coordinates?.[1]) || !feature.properties?.OBJECTID) {
      throw new Error('City dataset returned a candidate without a valid point or OBJECTID.');
    }
  }
  const candidates = features.map((feature) => toVictoriaParkingCandidate(feature, importedAt));
  const document = { schemaVersion: 1, generatedAt: importedAt, purpose: 'Local seed candidates requiring community verification before publication.', source: VICTORIA_ACCESSIBLE_PARKING, count: candidates.length, candidates };
  console.log(`Validated ${candidates.length} active accessible-parking candidates from the City layer.`);
  console.log(VICTORIA_ACCESSIBLE_PARKING.attribution);
  if (!process.argv.includes('--write')) {
    console.log('Dry run only. Pass --write to replace the local candidate snapshot; no database is accessed.');
    return;
  }
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
