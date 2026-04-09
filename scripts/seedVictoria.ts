/**
 * Seed script: 50 real places in Victoria, BC with accessibility data.
 * Run: npx tsx scripts/seedVictoria.ts
 */
import { MongoClient, ObjectId } from 'mongodb';
import slugify from 'slugify';
import { calculateAccessibilityScore } from '../src/models/Place';
import type { AccessibilityChecklist } from '../src/models/Place';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'accesslens';

const SYSTEM_USER_ID = new ObjectId();

function c(checklist: Partial<AccessibilityChecklist>) {
  return checklist;
}

const places = [
  // ==================== LIBRARIES ====================
  {
    name: 'Victoria Public Library — Central Branch',
    category: 'library',
    address: '735 Broughton St, Victoria, BC V8W 3H2',
    latitude: 48.4252, longitude: -123.3637,
    description: 'The main branch of the Victoria Public Library, located in downtown Victoria. A major community hub with extensive collections and programs.',
    website: 'https://www.vpl.ca',
    phone: '250-382-7241',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: false, transitAccessible: true, brailleSignage: true, serviceAnimalWelcome: true, quietSpace: true }),
    accessibilityNotes: 'Fully accessible main entrance on Broughton St. Elevator to all floors. Accessible washrooms on every floor.',
  },
  {
    name: 'Victoria Public Library — Esquimalt Branch',
    category: 'library',
    address: '1149 Esquimalt Rd, Victoria, BC V9A 3N6',
    latitude: 48.4296, longitude: -123.4108,
    description: 'Community library branch in Esquimalt with accessible facilities.',
    website: 'https://www.vpl.ca',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: false, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Greater Victoria Public Library — Oak Bay Branch',
    category: 'library',
    address: '1442 Monterey Ave, Oak Bay, BC V8S 4W6',
    latitude: 48.4239, longitude: -123.3223,
    description: 'Oak Bay municipal library with community programs.',
    checklist: c({ entranceRamp: true, automaticDoor: false, levelEntrance: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  // ==================== RESTAURANTS ====================
  {
    name: 'Noodlebox',
    category: 'restaurant',
    address: '818 Douglas St, Victoria, BC V8W 2B6',
    latitude: 48.4238, longitude: -123.3672,
    description: 'Popular noodle restaurant in downtown Victoria.',
    checklist: c({ entranceRamp: false, automaticDoor: false, levelEntrance: true, wideAisles: true, accessibleWashroom: true, accessibleParking: false, transitAccessible: true }),
    accessibilityNotes: 'Level entrance but tight seating. Accessible washroom at rear.',
  },
  {
    name: 'The Bard & Banker',
    category: 'restaurant',
    address: '1022 Government St, Victoria, BC V8W 1X7',
    latitude: 48.4254, longitude: -123.3695,
    description: 'Historic pub and restaurant in a converted bank building.',
    website: 'https://bardandbanker.com',
    checklist: c({ entranceRamp: false, automaticDoor: false, levelEntrance: false, elevator: false, wideAisles: false, accessibleWashroom: false, accessibleParking: false, transitAccessible: true }),
    accessibilityNotes: 'Steps at main entrance. Not fully wheelchair accessible.',
  },
  {
    name: 'Shine Café',
    category: 'restaurant',
    address: '1548 Fort St, Victoria, BC V8S 1Z3',
    latitude: 48.4231, longitude: -123.3538,
    description: 'Casual café and community space in Fernwood.',
    checklist: c({ entranceRamp: true, automaticDoor: false, levelEntrance: true, wideAisles: true, accessibleWashroom: true, accessibleParking: false, transitAccessible: true, serviceAnimalWelcome: true, quietSpace: true }),
  },
  {
    name: 'Pagliacci\'s Restaurant',
    category: 'restaurant',
    address: '1011 Broad St, Victoria, BC V8W 2A1',
    latitude: 48.4256, longitude: -123.3683,
    description: 'Legendary Victoria restaurant known for live music and Italian food.',
    checklist: c({ entranceRamp: true, automaticDoor: false, levelEntrance: true, wideAisles: false, accessibleWashroom: true, accessibleParking: false, transitAccessible: true }),
  },
  {
    name: 'Fishhook',
    category: 'restaurant',
    address: '805 Fort St, Victoria, BC V8W 1H6',
    latitude: 48.4243, longitude: -123.3657,
    description: 'Casual seafood restaurant in the Fort Street neighbourhood.',
    checklist: c({ entranceRamp: true, levelEntrance: true, automaticDoor: false, wideAisles: true, accessibleWashroom: true, accessibleParking: false, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Olo Restaurant',
    category: 'restaurant',
    address: '509 Fisgard St, Victoria, BC V8W 1R3',
    latitude: 48.4297, longitude: -123.3680,
    description: 'Farm-to-table restaurant in Chinatown.',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleWashroom: true, transitAccessible: true }),
  },
  {
    name: 'Blue Fox Café',
    category: 'restaurant',
    address: '919 Fort St, Victoria, BC V8V 3K3',
    latitude: 48.4245, longitude: -123.3644,
    description: 'Popular breakfast and brunch spot.',
    checklist: c({ levelEntrance: true, wideAisles: false, accessibleWashroom: false, transitAccessible: true }),
    accessibilityNotes: 'Narrow space inside. Can get very crowded.',
  },
  // ==================== MOVIE THEATRES ====================
  {
    name: 'Cineplex Odeon Victoria',
    category: 'movie_theatre',
    address: '3131 Shelbourne St, Victoria, BC V8P 5G8',
    latitude: 48.4466, longitude: -123.3419,
    description: 'Major multiplex cinema with multiple screens.',
    website: 'https://www.cineplex.com',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleSeating: true, accessibleWashroom: true, accessibleParking: true, audioAnnouncements: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'Fully accessible. Accessible seating in all theatres. Hearing loop available. Request assistance at box office.',
  },
  {
    name: 'Capital 6 Cinemas',
    category: 'movie_theatre',
    address: '805 Yates St, Victoria, BC V8W 1L8',
    latitude: 48.4225, longitude: -123.3634,
    description: 'Independent cinema in downtown Victoria showing a mix of blockbusters and art films.',
    checklist: c({ entranceRamp: true, automaticDoor: false, levelEntrance: false, elevator: false, accessibleSeating: false, accessibleWashroom: false, accessibleParking: false, transitAccessible: true }),
    accessibilityNotes: 'Steps to enter. Historic building with limited accessibility.',
  },
  {
    name: 'Roxy Theatre',
    category: 'movie_theatre',
    address: '2657 Quadra St, Victoria, BC V8T 4E4',
    latitude: 48.4431, longitude: -123.3624,
    description: 'Classic neighbourhood movie theatre.',
    checklist: c({ levelEntrance: true, accessibleSeating: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true }),
  },
  // ==================== PARKS ====================
  {
    name: 'Beacon Hill Park',
    category: 'park',
    address: '100 Cook St, Victoria, BC V8V 3W6',
    latitude: 48.4148, longitude: -123.3584,
    description: 'Victoria\'s iconic 75-hectare urban park with paved paths, gardens, a children\'s farm, and ocean views.',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleParking: true, transitAccessible: true, accessibleWashroom: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'Main paved paths are accessible. Some garden paths may be uneven. Accessible washrooms near Cook St village entrance.',
  },
  {
    name: 'Willows Beach Park',
    category: 'park',
    address: '100 Beach Dr, Oak Bay, BC V8S 2K9',
    latitude: 48.4283, longitude: -123.3026,
    description: 'Popular beach park on the Salish Sea with playground and picnic areas.',
    checklist: c({ levelEntrance: true, accessibleParking: true, accessibleWashroom: true, wideAisles: true, transitAccessible: false, serviceAnimalWelcome: true }),
  },
  {
    name: 'Dallas Road Waterfront',
    category: 'park',
    address: 'Dallas Rd & Douglas St, Victoria, BC',
    latitude: 48.4067, longitude: -123.3597,
    description: 'Scenic waterfront walkway along Dallas Road with ocean views and pedestrian paths.',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleParking: true, transitAccessible: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'Paved waterfront path is generally accessible. Some sections near rocks may be uneven.',
  },
  {
    name: 'Gorge Waterway Park',
    category: 'park',
    address: 'Gorge Rd E, Victoria, BC V9A 1K9',
    latitude: 48.4428, longitude: -123.3758,
    description: 'Linear park along the Gorge Waterway with walking trails and picnic areas.',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleParking: true, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Topaz Park',
    category: 'park',
    address: '1500 Cowichan St, Victoria, BC V8T 4J3',
    latitude: 48.4428, longitude: -123.3530,
    description: 'Community park with sports fields, playground, and walking paths.',
    checklist: c({ levelEntrance: true, accessibleParking: true, accessibleWashroom: true, wideAisles: true, transitAccessible: true }),
  },
  // ==================== GOVERNMENT BUILDINGS ====================
  {
    name: 'BC Legislature Buildings',
    category: 'government',
    address: '501 Belleville St, Victoria, BC V8V 2L1',
    latitude: 48.4199, longitude: -123.3704,
    description: 'The historic British Columbia Legislative Assembly buildings, home of the BC Government.',
    website: 'https://www.leg.bc.ca',
    phone: '250-387-3046',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: false, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, brailleSignage: true, audioAnnouncements: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'Accessible entrance on the west side of the building. Tours available and accessible.',
  },
  {
    name: 'Victoria City Hall',
    category: 'government',
    address: '1 Centennial Square, Victoria, BC V8W 1P6',
    latitude: 48.4288, longitude: -123.3673,
    description: 'Victoria\'s municipal city hall in the heart of downtown.',
    website: 'https://www.victoria.ca',
    phone: '250-385-5711',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: false, brailleSignage: true, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Service BC — Victoria',
    category: 'government',
    address: '14-3350 Douglas St, Victoria, BC V8Z 3L1',
    latitude: 48.4589, longitude: -123.3706,
    description: 'Provincial government service centre for driver licensing, ICBC, and other services.',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, audioAnnouncements: true, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Federal Building Victoria',
    category: 'government',
    address: '1230 Government St, Victoria, BC V8W 3M4',
    latitude: 48.4255, longitude: -123.3698,
    description: 'Federal government offices in downtown Victoria.',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  // ==================== TRANSIT ====================
  {
    name: 'Victoria Bus Depot (Downtown Exchange)',
    category: 'transit',
    address: '700 Douglas St, Victoria, BC V8W 3M6',
    latitude: 48.4264, longitude: -123.3660,
    description: 'The main downtown bus exchange for BC Transit in Victoria.',
    website: 'https://www.bctransit.com',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleParking: false, audioAnnouncements: true, brailleSignage: true, accessibleSeating: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'All buses on this route are low-floor accessible. Real-time audio announcements available.',
  },
  {
    name: 'Mayfair Mall Bus Exchange',
    category: 'transit',
    address: '3147 Douglas St, Victoria, BC V8Z 6E3',
    latitude: 48.4596, longitude: -123.3704,
    description: 'Major transit exchange point adjacent to Mayfair Shopping Centre.',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleSeating: true, accessibleParking: true, transitAccessible: true, audioAnnouncements: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Tillicum Centre Bus Stop',
    category: 'transit',
    address: '3170 Tillicum Rd, Victoria, BC V9A 7C3',
    latitude: 48.4556, longitude: -123.3875,
    description: 'Transit stop serving the Tillicum Centre area.',
    checklist: c({ levelEntrance: true, accessibleSeating: true, accessibleParking: false, transitAccessible: true }),
  },
  {
    name: 'University of Victoria Bus Exchange',
    category: 'transit',
    address: 'Ring Rd & McKinnon Rd, Victoria, BC V8W 2Y2',
    latitude: 48.4634, longitude: -123.3117,
    description: 'Transit hub serving the University of Victoria campus.',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleSeating: true, audioAnnouncements: true, serviceAnimalWelcome: true, transitAccessible: true }),
  },
  // ==================== SHOPPING ====================
  {
    name: 'Mayfair Shopping Centre',
    category: 'shopping',
    address: '3147 Douglas St, Victoria, BC V8Z 6E3',
    latitude: 48.4594, longitude: -123.3706,
    description: 'Large indoor shopping mall with major retailers.',
    website: 'https://www.mayfair.bc.ca',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, audioAnnouncements: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'Fully accessible. Multiple accessible entrances. Accessible parking throughout the lot.',
  },
  {
    name: 'Hillside Shopping Centre',
    category: 'shopping',
    address: '1644 Hillside Ave, Victoria, BC V8T 2C5',
    latitude: 48.4435, longitude: -123.3475,
    description: 'Shopping centre with a mix of national and local retailers.',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Bay Centre Shopping Mall',
    category: 'shopping',
    address: '1150 Douglas St, Victoria, BC V8W 3M9',
    latitude: 48.4254, longitude: -123.3664,
    description: 'Downtown indoor shopping mall on Douglas Street.',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, audioAnnouncements: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'Central atrium with elevator. Multiple accessible entrances on Douglas St and Fort St.',
  },
  {
    name: 'Market Square',
    category: 'shopping',
    address: '560 Johnson St, Victoria, BC V8W 3C6',
    latitude: 48.4292, longitude: -123.3681,
    description: 'Heritage marketplace in downtown Victoria with shops and restaurants.',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleWashroom: true, transitAccessible: true }),
    accessibilityNotes: 'Courtyard space. Some areas on upper levels may be difficult to access.',
  },
  {
    name: 'Broadmead Village Shopping Centre',
    category: 'shopping',
    address: '777 Royal Oak Dr, Saanich, BC V8X 4V1',
    latitude: 48.4857, longitude: -123.3498,
    description: 'Neighbourhood shopping centre in Broadmead with grocery and specialty stores.',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: false }),
  },
  // ==================== HOSPITALS / HEALTHCARE ====================
  {
    name: 'Royal Jubilee Hospital',
    category: 'hospital',
    address: '1952 Bay St, Victoria, BC V8R 1J8',
    latitude: 48.4403, longitude: -123.3416,
    description: 'Major acute care hospital serving Greater Victoria.',
    website: 'https://www.islandhealth.ca',
    phone: '250-370-8000',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, audioAnnouncements: true, brailleSignage: true, serviceAnimalWelcome: true, quietSpace: true }),
    accessibilityNotes: 'Fully accessible hospital. Wayfinding assistance available at main reception. Accessible parking in parkade.',
  },
  {
    name: 'Victoria General Hospital',
    category: 'hospital',
    address: '1 Hospital Way, Victoria, BC V8Z 6R5',
    latitude: 48.4578, longitude: -123.3981,
    description: 'Major general hospital and Level 1 trauma centre.',
    website: 'https://www.islandhealth.ca',
    phone: '250-727-4212',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, audioAnnouncements: true, brailleSignage: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'Valet service available for patients with accessibility needs. Accessible main entrance from Hospital Way.',
  },
  {
    name: 'Saanich Peninsula Hospital',
    category: 'hospital',
    address: '2166 Mt Newton Cross Rd, Saanichton, BC V8M 2B2',
    latitude: 48.5642, longitude: -123.4079,
    description: 'Community hospital serving the Saanich Peninsula.',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, accessibleWashroom: true, accessibleParking: true, serviceAnimalWelcome: true }),
  },
  // ==================== SCHOOLS ====================
  {
    name: 'University of Victoria',
    category: 'school',
    address: '3800 Finnerty Rd, Victoria, BC V8P 5C2',
    latitude: 48.4634, longitude: -123.3116,
    description: 'Major research university with comprehensive accessibility services.',
    website: 'https://www.uvic.ca',
    phone: '250-721-7211',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, brailleSignage: true, audioAnnouncements: true, serviceAnimalWelcome: true, quietSpace: true }),
    accessibilityNotes: 'Extensive accessible routes across campus. Accessibility Services office provides support. Campus map with accessible routes available.',
  },
  {
    name: 'Camosun College — Lansdowne Campus',
    category: 'school',
    address: '3100 Foul Bay Rd, Victoria, BC V8P 5J2',
    latitude: 48.4505, longitude: -123.3275,
    description: 'Public college campus with accessible facilities.',
    website: 'https://camosun.ca',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Victoria High School',
    category: 'school',
    address: '1260 Grant St, Victoria, BC V8T 1L5',
    latitude: 48.4337, longitude: -123.3560,
    description: 'Historic high school with over 125 years of history.',
    checklist: c({ entranceRamp: true, automaticDoor: false, levelEntrance: false, elevator: true, accessibleWashroom: true, accessibleParking: false, transitAccessible: true }),
    accessibilityNotes: 'Historic building. Accessible entrance on the north side. Elevator to upper floors.',
  },
  // ==================== SPORTS & RECREATION ====================
  {
    name: 'Crystal Pool & Fitness Centre',
    category: 'sports',
    address: '2275 Quadra St, Victoria, BC V8T 4C6',
    latitude: 48.4408, longitude: -123.3630,
    description: 'Victoria\'s major public aquatic and fitness centre.',
    website: 'https://www.victoria.ca/crystal-pool',
    phone: '250-361-0732',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: false, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'Accessible changing rooms. Pool lift available. Accessible shower area. Call ahead to arrange accessible services.',
  },
  {
    name: 'Save-On-Foods Memorial Centre',
    category: 'sports',
    address: '1925 Blanshard St, Victoria, BC V8T 4J2',
    latitude: 48.4301, longitude: -123.3630,
    description: 'Major sports and entertainment arena — home of the Victoria Royals hockey team.',
    website: 'https://www.sofmc.com',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleSeating: true, accessibleWashroom: true, accessibleParking: true, audioAnnouncements: true, serviceAnimalWelcome: true }),
    accessibilityNotes: 'Designated accessible seating areas. Accessible entrances on all sides. Ask staff for assistance.',
  },
  {
    name: 'Esquimalt Recreation Centre',
    category: 'sports',
    address: '527 Fraser St, Esquimalt, BC V9A 6H8',
    latitude: 48.4332, longitude: -123.4143,
    description: 'Community recreation centre with pool, fitness facilities, and ice rink.',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: false, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Gordon Head Recreation Centre',
    category: 'sports',
    address: '4100 Lambrick Way, Saanich, BC V8N 3E3',
    latitude: 48.4667, longitude: -123.2890,
    description: 'Municipal recreation centre with fitness, pool, and court facilities.',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: false, serviceAnimalWelcome: true }),
  },
  // ==================== SIDEWALKS ====================
  {
    name: 'Government Street Sidewalk (Downtown)',
    category: 'sidewalk',
    address: 'Government St between Humboldt St and Fisgard St, Victoria, BC',
    latitude: 48.4260, longitude: -123.3693,
    description: 'Main historic shopping street in downtown Victoria. Brick pavers in historic section.',
    checklist: c({ levelEntrance: true, wideAisles: true, transitAccessible: true }),
    accessibilityNotes: 'Historic brick pavers between Humboldt and View St can be uneven. Smoother concrete sidewalk from View to Fisgard.',
  },
  {
    name: 'Dallas Road Seawall',
    category: 'sidewalk',
    address: 'Dallas Rd, Victoria, BC V8V 1A1',
    latitude: 48.4071, longitude: -123.3610,
    description: 'Paved pedestrian and cycling path along the seafront.',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleParking: true }),
    accessibilityNotes: 'Wide paved path. Generally smooth but some sections near the shore may have slight slopes.',
  },
  {
    name: 'Inner Harbour Causeway',
    category: 'sidewalk',
    address: 'Inner Harbour Causeway, Victoria, BC V8W 1Y7',
    latitude: 48.4218, longitude: -123.3704,
    description: 'Pedestrian causeway along the Inner Harbour — one of Victoria\'s busiest pedestrian areas.',
    checklist: c({ levelEntrance: true, wideAisles: true, accessibleParking: false, transitAccessible: true }),
    accessibilityNotes: 'Smooth concrete surface. Wide path accommodates wheelchairs and strollers. Gets very busy in summer.',
  },
  {
    name: 'Johnson Street Bridge Pathway',
    category: 'sidewalk',
    address: 'Johnson St Bridge, Victoria, BC V8W 1L2',
    latitude: 48.4292, longitude: -123.3716,
    description: 'Pedestrian and cycling path on the modern Johnson Street Bridge.',
    checklist: c({ levelEntrance: true, wideAisles: true }),
    accessibilityNotes: 'Raised, protected pathway. Wide enough for wheelchairs and bikes.',
  },
  // ==================== OTHER ====================
  {
    name: 'Royal BC Museum',
    category: 'government',
    address: '675 Belleville St, Victoria, BC V8W 9W2',
    latitude: 48.4193, longitude: -123.3697,
    description: 'Provincial museum showcasing BC\'s natural and human history.',
    website: 'https://royalbcmuseum.bc.ca',
    phone: '250-356-7226',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: false, brailleSignage: true, audioAnnouncements: true, serviceAnimalWelcome: true, quietSpace: true }),
    accessibilityNotes: 'Fully accessible. Elevator to all floors. Audio guides available. Sensory kits for visitors.',
  },
  {
    name: 'Art Gallery of Greater Victoria',
    category: 'other',
    address: '1040 Moss St, Victoria, BC V8V 4P1',
    latitude: 48.4241, longitude: -123.3577,
    description: 'Public art gallery with historic and contemporary collections.',
    website: 'https://aggv.ca',
    phone: '250-384-4171',
    checklist: c({ entranceRamp: true, automaticDoor: false, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: false, transitAccessible: true, serviceAnimalWelcome: true }),
  },
  {
    name: 'Victoria Conference Centre',
    category: 'government',
    address: '720 Douglas St, Victoria, BC V8W 3M7',
    latitude: 48.4242, longitude: -123.3660,
    description: 'Major convention and conference facility in downtown Victoria.',
    website: 'https://www.victoriasconferencecentre.com',
    checklist: c({ entranceRamp: true, automaticDoor: true, levelEntrance: true, elevator: true, wideAisles: true, accessibleWashroom: true, accessibleParking: true, transitAccessible: true, audioAnnouncements: true, brailleSignage: true, serviceAnimalWelcome: true }),
  },
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const placesCollection = db.collection('places');

    // Create indexes (align with scripts/initIndexes.ts for geo queries)
    await placesCollection.createIndex({ citySlug: 1, category: 1 });
    await placesCollection.createIndex({ slug: 1 });
    await placesCollection.createIndex({ name: 'text', address: 'text' });
    await placesCollection.createIndex({ accessibilityScore: -1 });
    await placesCollection.createIndex({ location: '2dsphere' });
    console.log('✓ Indexes created (including location 2dsphere)');

    let inserted = 0;
    let skipped = 0;

    for (const p of places) {
      const slug = slugify(p.name, { lower: true, strict: true });

      // Skip if already exists
      const existing = await placesCollection.findOne({ name: p.name, citySlug: 'victoria-bc' });
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
        city: 'Victoria',
        citySlug: 'victoria-bc',
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
        createdByUserId: SYSTEM_USER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted++;
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   ${inserted} places inserted`);
    console.log(`   ${skipped} places already existed (skipped)`);
    console.log(`   Total: ${places.length} places in dataset`);

    // Summary by category
    const cats = await placesCollection.aggregate([
      { $match: { citySlug: 'victoria-bc' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray();

    console.log('\n📊 Places by category:');
    cats.forEach((c) => console.log(`   ${c._id}: ${c.count}`));

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();
