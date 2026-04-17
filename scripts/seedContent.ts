/**
 * Seed script: populate the `site_content` collection with editable landing-page blocks.
 * Idempotent: upserts by key. Does NOT overwrite existing payloads unless the
 * `--force` flag is passed (so edits made through the admin API/Compass survive re-runs).
 *
 * Run:
 *   npx tsx scripts/seedContent.ts            (insert missing only)
 *   npx tsx scripts/seedContent.ts --force    (overwrite all keys with defaults)
 */
import { MongoClient } from 'mongodb';
import type {
  HomeCtaContent,
  HomeFeatureItem,
  HomeHeroContent,
  HomeChecklistItem,
  HomeStepItem,
  HomeTestimonialContent,
  HomeTrustStripItem,
  HomeValueItem,
  SiteContentKey,
} from '../src/models/SiteContent';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'accesslens';
const FORCE = process.argv.includes('--force');

const VERSION = 1;

const hero: HomeHeroContent = {
  eyebrow: 'Now live in Victoria, BC',
  titleLine1: 'Find Accessible Places',
  titleLine2: 'in Your City',
  description:
    'AccessLens is the community-driven accessibility map for public places. Search, review, and report accessibility information so everyone can navigate their city with confidence.',
  primaryCtaLabel: 'Explore the map',
  primaryCtaHref: '/explore',
  secondaryCtaLabel: 'Join the Community',
  secondaryCtaHref: '/signup',
};

const trustStrip: HomeTrustStripItem[] = [
  { label: 'Community-led reviews', icon: 'Users' },
  { label: 'Photo evidence', icon: 'Camera' },
  { label: 'Transparent checklists', icon: 'ShieldCheck' },
  { label: 'Free to use', icon: 'Sparkles' },
];

const features: HomeFeatureItem[] = [
  {
    title: 'Real Accessibility Data',
    description:
      'Community-verified accessibility information for every place — entrances, washrooms, parking, elevators, and more.',
    icon: 'MapPin',
    colorClass: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Photo Evidence',
    description:
      'Photos of ramps, doors, washrooms, and pathways uploaded by real people who visit these places.',
    icon: 'Camera',
    colorClass: 'text-emerald-600 bg-emerald-50',
  },
  {
    title: 'Accessibility Score',
    description:
      'Each place gets an accessibility score from 0–100 based on community reviews and checklist data.',
    icon: 'Star',
    colorClass: 'text-amber-600 bg-amber-50',
  },
  {
    title: 'Community Reports',
    description:
      'Real-time reports of broken elevators, blocked ramps, and construction barriers so you always have current info.',
    icon: 'Users',
    colorClass: 'text-purple-600 bg-purple-50',
  },
];

const values: HomeValueItem[] = [
  {
    title: 'Grounded in lived experience',
    description:
      'Accessibility is not a checkbox — it is how real people move through doors, aisles, transit, and services every day.',
    icon: 'Heart',
    colorClass: 'text-rose-600 bg-rose-50',
  },
  {
    title: 'Plan with confidence',
    description:
      'See entrances, washrooms, parking, and elevators before you go, so fewer surprises when you arrive.',
    icon: 'Compass',
    colorClass: 'text-primary-600 bg-primary-50',
  },
  {
    title: 'Stronger when we share',
    description:
      'Every photo and honest review helps the next visitor. Your knowledge makes the map more useful for everyone.',
    icon: 'Users',
    colorClass: 'text-violet-600 bg-violet-50',
  },
];

const howItWorks: HomeStepItem[] = [
  {
    step: '1',
    title: 'Search a place',
    description: 'Find any public place near you — restaurants, parks, theatres, libraries.',
  },
  {
    step: '2',
    title: 'View accessibility details',
    description: 'See the accessibility checklist, score, photos, and community reviews.',
  },
  {
    step: '3',
    title: 'Contribute your experience',
    description: 'Upload photos, complete the accessibility checklist, and share your honest review.',
  },
];

const sampleChecklist: HomeChecklistItem[] = [
  { label: 'Entrance ramp or level access', checked: true },
  { label: 'Automatic door opener', checked: true },
  { label: 'Elevator to all floors', checked: true },
  { label: 'Accessible washroom', checked: false },
  { label: 'Accessible parking', checked: true },
  { label: 'Wide aisles (36"+)', checked: false },
  { label: 'Braille signage', checked: false },
  { label: 'Service animals welcome', checked: true },
];

const cta: HomeCtaContent = {
  title: "Help build your city's accessibility map",
  description:
    'Every review, photo, and checklist update helps someone plan their day with less uncertainty. Sign up to contribute, or explore the map anonymously anytime.',
  primaryCtaLabel: 'Create free account',
  primaryCtaHref: '/signup',
  secondaryCtaLabel: 'Browse without signing up',
  secondaryCtaHref: '/explore',
};

const testimonial: HomeTestimonialContent = {
  quote:
    'When the details are shared openly, we all move through the city with more dignity and fewer surprises.',
  attribution: 'The AccessLens community',
};

const seeds: Array<{ key: SiteContentKey; data: unknown }> = [
  { key: 'home.hero', data: hero },
  { key: 'home.trustStrip', data: trustStrip },
  { key: 'home.features', data: features },
  { key: 'home.values', data: values },
  { key: 'home.howItWorks', data: howItWorks },
  { key: 'home.sampleChecklist', data: sampleChecklist },
  { key: 'home.cta', data: cta },
  { key: 'home.testimonial', data: testimonial },
];

async function seedContent() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('site_content');

    await collection.createIndex({ key: 1 }, { unique: true });

    const now = new Date();
    let inserted = 0;
    let overwritten = 0;
    let skipped = 0;

    for (const seed of seeds) {
      if (FORCE) {
        const res = await collection.updateOne(
          { key: seed.key },
          {
            $set: { key: seed.key, version: VERSION, data: seed.data, updatedAt: now },
          },
          { upsert: true }
        );
        if (res.upsertedCount > 0) inserted++;
        else overwritten++;
      } else {
        const res = await collection.updateOne(
          { key: seed.key },
          {
            $setOnInsert: {
              key: seed.key,
              version: VERSION,
              data: seed.data,
              updatedAt: now,
            },
          },
          { upsert: true }
        );
        if (res.upsertedCount > 0) inserted++;
        else skipped++;
      }
    }

    console.log(
      `✓ site_content: ${inserted} inserted, ${overwritten} overwritten, ${skipped} skipped (of ${seeds.length}). Force mode: ${FORCE}`
    );
    console.log('\n✅ Content seed complete.');
  } catch (err) {
    console.error('❌ Error seeding site content:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedContent();
