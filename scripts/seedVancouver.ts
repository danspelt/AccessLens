/**
 * Seed script: ~15 high-confidence civic / transit locations in Vancouver, BC.
 *
 * Accessibility checklists are based on publicly known facility standards for
 * major civic buildings and transit hubs (not a full street-level audit).
 * Notes flag confidence; treat as directional, not a legal accessibility guarantee.
 *
 * Idempotent: skips existing rows matched by name + citySlug.
 * Run: node --env-file=.env.local --import tsx scripts/seedVancouver.ts
 */
import { MongoClient, ObjectId } from 'mongodb';
import slugify from 'slugify';
import { calculateAccessibilityScore } from '../src/models/Place';
import type { AccessibilityChecklist } from '../src/models/Place';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'accesslens';

const SYSTEM_USER_ID = new ObjectId();
const CITY = 'Vancouver';
const CITY_SLUG = 'vancouver-bc';

function c(checklist: Partial<AccessibilityChecklist>) {
  return checklist;
}

const places = [
  {
    name: 'Vancouver City Hall',
    category: 'government',
    address: '453 W 12th Ave, Vancouver, BC V5Y 1V4',
    latitude: 49.2609,
    longitude: -123.1139,
    description: 'Municipal seat of government for the City of Vancouver.',
    website: 'https://vancouver.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      brailleSignage: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes:
      'High-confidence civic building. Elevators and accessible entrances are standard for City Hall; verify elevators on arrival.',
  },
  {
    name: 'Vancouver Public Library — Central Branch',
    category: 'library',
    address: '350 W Georgia St, Vancouver, BC V6B 6B1',
    latitude: 49.2797,
    longitude: -123.1156,
    description: 'Flagship downtown branch of the Vancouver Public Library.',
    website: 'https://www.vpl.ca',
    phone: '604-331-3603',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: false,
      transitAccessible: true,
      brailleSignage: true,
      serviceAnimalWelcome: true,
      quietSpace: true,
    }),
    accessibilityNotes: 'Major civic library with elevators to all floors and accessible washrooms.',
  },
  {
    name: 'Canada Place',
    category: 'other',
    address: '999 Canada Place, Vancouver, BC V6C 3T4',
    latitude: 49.2888,
    longitude: -123.1111,
    description: 'Waterfront landmark with convention facilities and cruise terminals.',
    website: 'https://www.canadaplace.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'Large public complex with elevators and step-free routes along the promenade.',
  },
  {
    name: 'Waterfront Station',
    category: 'transit',
    address: '601 W Cordova St, Vancouver, BC V6B 1G1',
    latitude: 49.2856,
    longitude: -123.1119,
    description: 'Major SkyTrain, SeaBus, and West Coast Express hub.',
    website: 'https://www.translink.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: false,
      transitAccessible: true,
      brailleSignage: true,
      audioAnnouncements: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'TransLink hub with elevators between concourses; elevators can be out of service — check TransLink alerts.',
  },
  {
    name: 'Pacific Central Station',
    category: 'transit',
    address: '1150 Station St, Vancouver, BC V6A 4C7',
    latitude: 49.2736,
    longitude: -123.0979,
    description: 'Via Rail and intercity bus terminal.',
    website: 'https://www.viarail.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'Intercity terminal with accessible platforms and washrooms.',
  },
  {
    name: 'Broadway–City Hall Station',
    category: 'transit',
    address: 'Cambie St & W Broadway, Vancouver, BC',
    latitude: 49.2632,
    longitude: -123.1151,
    description: 'Canada Line SkyTrain station serving City Hall and Broadway corridor.',
    website: 'https://www.translink.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: false,
      accessibleParking: false,
      transitAccessible: true,
      brailleSignage: true,
      audioAnnouncements: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'Elevator-equipped Canada Line station.',
  },
  {
    name: 'Vancouver Art Gallery',
    category: 'other',
    address: '750 Hornby St, Vancouver, BC V6Z 2H7',
    latitude: 49.2827,
    longitude: -123.1207,
    description: 'Major public art museum in downtown Vancouver.',
    website: 'https://www.vanartgallery.bc.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: false,
      transitAccessible: true,
      serviceAnimalWelcome: true,
      quietSpace: true,
    }),
    accessibilityNotes: 'Public museum with elevators and accessible washrooms; check gallery for quiet hours.',
  },
  {
    name: 'Science World at TELUS World of Science',
    category: 'other',
    address: '1455 Quebec St, Vancouver, BC V6A 3Z7',
    latitude: 49.2734,
    longitude: -123.1038,
    description: 'Science centre at False Creek.',
    website: 'https://www.scienceworld.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'Large civic attraction with elevators and accessible parking nearby.',
  },
  {
    name: 'BC Place Stadium',
    category: 'sports',
    address: '777 Pacific Blvd, Vancouver, BC V6B 4Y8',
    latitude: 49.2767,
    longitude: -123.112,
    description: 'Downtown stadium for sports and major events.',
    website: 'https://www.bcplace.com',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleSeating: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'Event venue with accessible seating sections and elevators; confirm with box office for specific events.',
  },
  {
    name: 'Rogers Arena',
    category: 'sports',
    address: '800 Griffiths Way, Vancouver, BC V6B 6G1',
    latitude: 49.2778,
    longitude: -123.1089,
    description: 'Home arena for the Vancouver Canucks.',
    website: 'https://www.rogersarena.com',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleSeating: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'Arena with accessible seating and elevators between levels.',
  },
  {
    name: 'Vancouver General Hospital',
    category: 'hospital',
    address: '899 W 12th Ave, Vancouver, BC V5Z 1M9',
    latitude: 49.2614,
    longitude: -123.1233,
    description: 'Major tertiary hospital in the Broadway corridor.',
    website: 'https://www.vch.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      brailleSignage: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'Hospital campus with multiple accessible entrances and elevators; wayfinding can be complex.',
  },
  {
    name: 'Stanley Park — Prospect Point',
    category: 'park',
    address: 'Prospect Point, Stanley Park, Vancouver, BC',
    latitude: 49.313,
    longitude: -123.1422,
    description: 'Popular viewpoint within Stanley Park.',
    website: 'https://vancouver.ca/parks-recreation-culture/stanley-park.aspx',
    checklist: c({
      entranceRamp: false,
      automaticDoor: false,
      levelEntrance: false,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes:
      'Park paths vary; Prospect Point area has accessible parking and washrooms but some slopes. Surface conditions change with weather.',
  },
  {
    name: 'Queen Elizabeth Park — Bloedel Conservatory',
    category: 'park',
    address: '4600 Cambie St, Vancouver, BC V5Y 2M4',
    latitude: 49.2418,
    longitude: -123.1126,
    description: 'Hilltop park and conservatory with city views.',
    website: 'https://vancouver.ca/parks-recreation-culture/queen-elizabeth-park.aspx',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'Conservatory and plaza have elevator/ramp access; some garden paths are steeper.',
  },
  {
    name: 'UBC — Irving K. Barber Learning Centre',
    category: 'library',
    address: '1961 East Mall, Vancouver, BC V6T 1Z1',
    latitude: 49.2676,
    longitude: -123.2528,
    description: 'Central academic library on the UBC Point Grey campus.',
    website: 'https://ikblc.ubc.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: true,
      transitAccessible: true,
      brailleSignage: true,
      serviceAnimalWelcome: true,
      quietSpace: true,
    }),
    accessibilityNotes: 'Campus library with elevators and accessible washrooms.',
  },
  {
    name: 'Vancouver Community College — Downtown Campus',
    category: 'school',
    address: '250 W Pender St, Vancouver, BC V6B 1S9',
    latitude: 49.2808,
    longitude: -123.1108,
    description: 'Downtown campus of Vancouver Community College.',
    website: 'https://www.vcc.ca',
    checklist: c({
      entranceRamp: true,
      automaticDoor: true,
      levelEntrance: true,
      elevator: true,
      wideAisles: true,
      accessibleWashroom: true,
      accessibleParking: false,
      transitAccessible: true,
      serviceAnimalWelcome: true,
    }),
    accessibilityNotes: 'Public college campus with elevator access between floors.',
  },
];

async function seedVancouver() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    const db = client.db(MONGODB_DB);
    const placesCollection = db.collection('places');

    const safeIdx = async (
      spec: Parameters<typeof placesCollection.createIndex>[0],
      options?: Parameters<typeof placesCollection.createIndex>[1]
    ) => {
      try {
        await placesCollection.createIndex(spec, options);
      } catch (e) {
        console.warn(`  ! places index skipped: ${e instanceof Error ? e.message : String(e)}`);
      }
    };
    await safeIdx({ citySlug: 1, category: 1 });
    await safeIdx({ slug: 1 });
    await safeIdx({ location: '2dsphere' });

    let inserted = 0;
    let skipped = 0;

    for (const p of places) {
      const slug = slugify(p.name, { lower: true, strict: true });
      const existing = await placesCollection.findOne({ slug, citySlug: CITY_SLUG });
      if (existing) {
        skipped++;
        continue;
      }

      const checklist = p.checklist || {};
      const accessibilityScore = calculateAccessibilityScore(checklist);

      await placesCollection.insertOne({
        _id: new ObjectId(),
        name: p.name,
        slug,
        category: p.category,
        address: p.address,
        city: CITY,
        citySlug: CITY_SLUG,
        province: 'BC',
        country: 'Canada',
        description: p.description || '',
        website: p.website,
        phone: p.phone,
        checklist,
        accessibilityScore,
        accessibilityNotes: p.accessibilityNotes,
        photoUrls: [],
        latitude: p.latitude,
        longitude: p.longitude,
        location: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude],
        },
        status: 'active',
        createdByUserId: SYSTEM_USER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted++;
    }

    console.log(`\n✅ Vancouver seeding complete!`);
    console.log(`   ${inserted} places inserted`);
    console.log(`   ${skipped} places already existed (skipped)`);
    console.log(`   Total in dataset: ${places.length}`);
  } catch (err) {
    console.error('❌ Error seeding Vancouver:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedVancouver();
