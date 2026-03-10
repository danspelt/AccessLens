import { ObjectId } from 'mongodb';
import { calculateAccessibilityScore, createPlaceSlug, getAccessibilityStatus } from '@/lib/accesslens/constants';
import { Place } from '@/models/Place';
import { Review } from '@/models/Review';

const seedUserId = new ObjectId('660000000000000000000001');
const reviewerOneId = new ObjectId('660000000000000000000002');
const reviewerTwoId = new ObjectId('660000000000000000000003');

function buildPlace(input: Omit<Place, '_id' | 'slug' | 'accessibilityScore' | 'accessibilityStatus'> & {
  id: string;
}) {
  const accessibilityScore = calculateAccessibilityScore(input.accessibilityChecklist);

  return {
    _id: new ObjectId(input.id),
    slug: createPlaceSlug(input.name),
    accessibilityScore,
    accessibilityStatus: getAccessibilityStatus(accessibilityScore),
    ...input,
  } satisfies Place;
}

export const SEEDED_PLACES: Place[] = [
  buildPlace({
    id: '660000000000000000000101',
    name: 'Victoria Public Library Central Branch',
    category: 'libraries',
    address: '735 Broughton Street',
    city: 'Victoria',
    citySlug: 'victoria-bc',
    province: 'BC',
    country: 'Canada',
    description:
      'Downtown public library branch with elevator access, study spaces, and a frequently used main entrance.',
    accessibilityChecklist: {
      ramp: true,
      automaticDoor: true,
      elevator: true,
      accessibleWashroom: true,
      accessibleParking: false,
      wideAisles: true,
      smoothPath: true,
    },
    accessibilityNotes:
      'Main entrance is step-free from the plaza side. Staff can usually help direct visitors to the accessible washroom.',
    photoUrls: [],
    latitude: 48.4279,
    longitude: -123.3672,
    createdByUserId: seedUserId,
    createdAt: new Date('2026-01-10T18:30:00.000Z'),
    updatedAt: new Date('2026-01-10T18:30:00.000Z'),
  }),
  buildPlace({
    id: '660000000000000000000102',
    name: 'Cineplex Odeon Victoria Cinemas',
    category: 'movie-theatres',
    address: '780 Yates Street',
    city: 'Victoria',
    citySlug: 'victoria-bc',
    province: 'BC',
    country: 'Canada',
    description:
      'Downtown cinema with accessible viewing areas, elevator access to upper levels, and variable crowd flow depending on showtime.',
    accessibilityChecklist: {
      ramp: true,
      automaticDoor: true,
      elevator: true,
      accessibleWashroom: true,
      accessibleParking: false,
      wideAisles: true,
      smoothPath: true,
    },
    accessibilityNotes:
      'Accessible seating is available, but busy evenings may make the lobby and concession zone harder to navigate.',
    photoUrls: [],
    latitude: 48.4271,
    longitude: -123.3642,
    createdByUserId: seedUserId,
    createdAt: new Date('2026-01-11T18:30:00.000Z'),
    updatedAt: new Date('2026-01-11T18:30:00.000Z'),
  }),
  buildPlace({
    id: '660000000000000000000103',
    name: 'Beacon Hill Park South Entrance',
    category: 'parks',
    address: 'Douglas Street & Circle Drive',
    city: 'Victoria',
    citySlug: 'victoria-bc',
    province: 'BC',
    country: 'Canada',
    description:
      'Popular park entrance with paved routes into Beacon Hill Park and mixed terrain once deeper inside the park.',
    accessibilityChecklist: {
      ramp: true,
      automaticDoor: false,
      elevator: false,
      accessibleWashroom: true,
      accessibleParking: true,
      wideAisles: true,
      smoothPath: true,
    },
    accessibilityNotes:
      'The main paved path is generally smooth, but some gravel and sloped sections branch off from the primary route.',
    photoUrls: [],
    latitude: 48.4149,
    longitude: -123.3617,
    createdByUserId: seedUserId,
    createdAt: new Date('2026-01-12T18:30:00.000Z'),
    updatedAt: new Date('2026-01-12T18:30:00.000Z'),
  }),
  buildPlace({
    id: '660000000000000000000104',
    name: 'BC Legislature Visitor Entrance',
    category: 'government-buildings',
    address: '501 Belleville Street',
    city: 'Victoria',
    citySlug: 'victoria-bc',
    province: 'BC',
    country: 'Canada',
    description:
      'Historic government building with security screening, public tours, and multiple entry points to verify before visiting.',
    accessibilityChecklist: {
      ramp: true,
      automaticDoor: false,
      elevator: true,
      accessibleWashroom: true,
      accessibleParking: true,
      wideAisles: true,
      smoothPath: true,
    },
    accessibilityNotes:
      'Historic architecture means some entrances can be less intuitive. Call ahead if you need the clearest accessible route.',
    photoUrls: [],
    latitude: 48.4195,
    longitude: -123.3707,
    createdByUserId: seedUserId,
    createdAt: new Date('2026-01-12T19:30:00.000Z'),
    updatedAt: new Date('2026-01-12T19:30:00.000Z'),
  }),
  buildPlace({
    id: '660000000000000000000105',
    name: 'Centennial Square Sidewalk Segment',
    category: 'sidewalks',
    address: '1 Centennial Square',
    city: 'Victoria',
    citySlug: 'victoria-bc',
    province: 'BC',
    country: 'Canada',
    description:
      'Downtown sidewalk segment often used to access City Hall, with curb cuts and heavy pedestrian traffic.',
    accessibilityChecklist: {
      ramp: true,
      automaticDoor: false,
      elevator: false,
      accessibleWashroom: false,
      accessibleParking: false,
      wideAisles: true,
      smoothPath: true,
    },
    accessibilityNotes:
      'Surface is mostly smooth and level, but street furniture and event setups can narrow the usable path.',
    photoUrls: [],
    latitude: 48.4286,
    longitude: -123.3657,
    createdByUserId: seedUserId,
    createdAt: new Date('2026-01-13T18:30:00.000Z'),
    updatedAt: new Date('2026-01-13T18:30:00.000Z'),
  }),
  buildPlace({
    id: '660000000000000000000106',
    name: 'Government Street at Yates Crosswalk',
    category: 'crosswalks',
    address: 'Government Street & Yates Street',
    city: 'Victoria',
    citySlug: 'victoria-bc',
    province: 'BC',
    country: 'Canada',
    description:
      'Busy downtown crosswalk with curb cuts, audible signals nearby, and heavy turning traffic at peak times.',
    accessibilityChecklist: {
      ramp: true,
      automaticDoor: false,
      elevator: false,
      accessibleWashroom: false,
      accessibleParking: false,
      wideAisles: false,
      smoothPath: true,
    },
    accessibilityNotes:
      'Crossing surface is usable, but timing and traffic pressure can make the experience challenging during busy periods.',
    photoUrls: [],
    latitude: 48.4268,
    longitude: -123.3661,
    createdByUserId: seedUserId,
    createdAt: new Date('2026-01-14T18:30:00.000Z'),
    updatedAt: new Date('2026-01-14T18:30:00.000Z'),
  }),
  buildPlace({
    id: '660000000000000000000107',
    name: 'Bay Centre',
    category: 'shopping-centres',
    address: '1150 Douglas Street',
    city: 'Victoria',
    citySlug: 'victoria-bc',
    province: 'BC',
    country: 'Canada',
    description:
      'Major downtown shopping centre with elevators, wide corridors, and several accessible entrances.',
    accessibilityChecklist: {
      ramp: true,
      automaticDoor: true,
      elevator: true,
      accessibleWashroom: true,
      accessibleParking: true,
      wideAisles: true,
      smoothPath: true,
    },
    accessibilityNotes:
      'One of the stronger downtown options for indoor navigation, though elevators can be busy during peak shopping hours.',
    photoUrls: [],
    latitude: 48.4278,
    longitude: -123.3651,
    createdByUserId: seedUserId,
    createdAt: new Date('2026-01-15T18:30:00.000Z'),
    updatedAt: new Date('2026-01-15T18:30:00.000Z'),
  }),
  buildPlace({
    id: '660000000000000000000108',
    name: 'Royal Jubilee Hospital Patient Entrance',
    category: 'hospitals',
    address: '1952 Bay Street',
    city: 'Victoria',
    citySlug: 'victoria-bc',
    province: 'BC',
    country: 'Canada',
    description:
      'Hospital entrance with accessible drop-off, elevators, and wayfinding that can take time for first-time visitors.',
    accessibilityChecklist: {
      ramp: true,
      automaticDoor: true,
      elevator: true,
      accessibleWashroom: true,
      accessibleParking: true,
      wideAisles: true,
      smoothPath: true,
    },
    accessibilityNotes:
      'Accessible arrival is strong, but distances inside the hospital are long and wayfinding support is helpful.',
    photoUrls: [],
    latitude: 48.4266,
    longitude: -123.3385,
    createdByUserId: seedUserId,
    createdAt: new Date('2026-01-16T18:30:00.000Z'),
    updatedAt: new Date('2026-01-16T18:30:00.000Z'),
  }),
];

export const SEEDED_REVIEWS: Array<
  Review & {
    userName: string;
  }
> = [
  {
    _id: new ObjectId('660000000000000000000201'),
    placeId: SEEDED_PLACES[0]._id,
    userId: reviewerOneId,
    userName: 'Maya T.',
    rating: 5,
    headline: 'Strong downtown library access',
    comment:
      'Automatic doors worked well, elevator access was straightforward, and the main floor circulation felt wide enough for a power chair.',
    accessibilityNotes:
      'Washroom signage was decent, although more wayfinding at the entrance would help first-time visitors.',
    photoUrls: [],
    createdAt: new Date('2026-02-03T17:00:00.000Z'),
    updatedAt: new Date('2026-02-03T17:00:00.000Z'),
  },
  {
    _id: new ObjectId('660000000000000000000202'),
    placeId: SEEDED_PLACES[2]._id,
    userId: reviewerTwoId,
    userName: 'Jordan P.',
    rating: 4,
    headline: 'Good paved route, mixed park surfaces deeper in',
    comment:
      'The main entrance path was smooth and easy, but not every branch trail stays accessible once you move farther into the park.',
    accessibilityNotes:
      'Helpful place for a short visit if you stay on the paved network.',
    photoUrls: [],
    createdAt: new Date('2026-02-11T17:00:00.000Z'),
    updatedAt: new Date('2026-02-11T17:00:00.000Z'),
  },
  {
    _id: new ObjectId('660000000000000000000203'),
    placeId: SEEDED_PLACES[5]._id,
    userId: reviewerOneId,
    userName: 'Maya T.',
    rating: 3,
    headline: 'Crossing works, but timing feels tight',
    comment:
      'Curb cuts are present and the surface is okay, though the crossing still feels rushed when traffic is busy downtown.',
    accessibilityNotes:
      'Worth flagging as a spot to reassess during construction or signal timing changes.',
    photoUrls: [],
    createdAt: new Date('2026-02-18T17:00:00.000Z'),
    updatedAt: new Date('2026-02-18T17:00:00.000Z'),
  },
];
