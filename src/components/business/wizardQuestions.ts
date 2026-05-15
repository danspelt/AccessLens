import { STANDARD_ANSWERS } from '@/components/business/TouchAnswerButtons';
import type { AccessibilityProfile } from '@/models/AccessibilityProfile';

export type ProfileSectionKey = keyof Pick<
  AccessibilityProfile,
  'entrance' | 'interior' | 'washroom' | 'communication' | 'sensory' | 'transport'
>;

export type WizardQuestion = {
  section: ProfileSectionKey;
  field: string;
  label: string;
  options?: { value: string; label: string; emoji?: string }[];
};

export const WIZARD_SECTION_META: Record<
  ProfileSectionKey,
  { title: string; intro: string }
> = {
  entrance: {
    title: 'Entrance & exterior',
    intro: 'Help visitors understand how they can get inside.',
  },
  interior: {
    title: 'Interior mobility',
    intro: 'Aisles, seating, and moving around inside your space.',
  },
  washroom: {
    title: 'Washrooms',
    intro: 'Customer washroom access for visitors.',
  },
  communication: {
    title: 'Communication & hearing',
    intro: 'How customers can reach you and get information.',
  },
  sensory: {
    title: 'Sensory & cognitive access',
    intro: 'Lighting, navigation, and customer support.',
  },
  transport: {
    title: 'Parking & transportation',
    intro: 'Getting to your door by car or transit.',
  },
};

const YES_NO_UNSURE = [
  { value: 'yes', label: 'Yes', emoji: '✅' },
  { value: 'no', label: 'No', emoji: '❌' },
  { value: 'unsure', label: 'Unsure', emoji: '❓' },
];

const LIMITED_YES = [
  { value: 'yes', label: 'Yes', emoji: '✅' },
  { value: 'limited', label: 'Limited', emoji: '⚠️' },
  { value: 'no', label: 'No', emoji: '❌' },
];

const STAFF_OPTIONS = [
  { value: 'yes', label: 'Yes', emoji: '✅' },
  { value: 'some_staff', label: 'Some staff', emoji: '⚠️' },
  { value: 'no', label: 'No', emoji: '❌' },
  { value: 'unsure', label: 'Unsure', emoji: '❓' },
];

const DOOR_OPTIONS = [
  { value: 'yes', label: 'Yes', emoji: '✅' },
  { value: 'assisted', label: 'Staff can help', emoji: '🤝' },
  { value: 'no', label: 'No', emoji: '❌' },
  { value: 'unsure', label: 'Unsure', emoji: '❓' },
];

const ELEVATOR_OPTIONS = [
  { value: 'yes', label: 'Yes', emoji: '✅' },
  { value: 'limited', label: 'Limited access', emoji: '⚠️' },
  { value: 'no', label: 'No', emoji: '❌' },
  { value: 'single_floor', label: 'Single floor only', emoji: '🏢' },
];

const BY_REQUEST = [
  { value: 'yes', label: 'Yes', emoji: '✅' },
  { value: 'by_request', label: 'On request', emoji: '📋' },
  { value: 'no', label: 'No', emoji: '❌' },
];

const NOISE_OPTIONS = [
  { value: 'yes', label: 'Usually quiet', emoji: '✅' },
  { value: 'sometimes_loud', label: 'Sometimes loud', emoji: '⚠️' },
  { value: 'no', label: 'Often loud', emoji: '❌' },
  { value: 'unsure', label: 'Unsure', emoji: '❓' },
];

const SOMETIMES_OPTIONS = [
  { value: 'yes', label: 'Yes', emoji: '✅' },
  { value: 'sometimes', label: 'Sometimes', emoji: '⚠️' },
  { value: 'no', label: 'No', emoji: '❌' },
  { value: 'unsure', label: 'Unsure', emoji: '❓' },
];

const BUSY_OPTIONS = [
  { value: 'yes', label: 'Easy to navigate', emoji: '✅' },
  { value: 'busy_at_times', label: 'Busy at times', emoji: '⚠️' },
  { value: 'no', label: 'Hard to navigate', emoji: '❌' },
  { value: 'unsure', label: 'Unsure', emoji: '❓' },
];

const TURNING_SPACE = [
  { value: 'yes', label: 'Yes', emoji: '✅' },
  { value: 'limited', label: 'Limited', emoji: '⚠️' },
  { value: 'no', label: 'No', emoji: '❌' },
  { value: 'unsure', label: 'Unsure', emoji: '❓' },
];

const CUSTOMER_WASHROOM = [
  { value: 'yes', label: 'Yes', emoji: '✅' },
  { value: 'no', label: 'No', emoji: '❌' },
];

export const QUESTIONS_BY_SECTION: Record<ProfileSectionKey, WizardQuestion[]> = {
  entrance: [
    { section: 'entrance', field: 'stepFree', label: 'Can customers enter without using stairs?', options: STANDARD_ANSWERS },
    { section: 'entrance', field: 'ramp', label: 'Is a ramp available?', options: STANDARD_ANSWERS },
    {
      section: 'entrance',
      field: 'wideDoor',
      label: 'Is the entrance wide enough for most wheelchairs or scooters?',
      options: [
        { value: 'yes', label: 'Yes', emoji: '✅' },
        { value: 'partial', label: 'Partial', emoji: '⚠️' },
        { value: 'no', label: 'No', emoji: '❌' },
        { value: 'unsure', label: 'Unsure', emoji: '❓' },
      ],
    },
    { section: 'entrance', field: 'automaticDoor', label: 'Is the door automatic or easy to open?', options: DOOR_OPTIONS },
    { section: 'entrance', field: 'smoothPath', label: 'Is the path to the entrance smooth and obstacle-free?', options: STANDARD_ANSWERS },
    { section: 'entrance', field: 'seatingNearEntrance', label: 'Is there seating near the entrance?', options: YES_NO_UNSURE },
  ],
  interior: [
    {
      section: 'interior',
      field: 'wheelchairMovement',
      label: 'Can customers move through most areas with a wheelchair, walker, or scooter?',
      options: STANDARD_ANSWERS,
    },
    { section: 'interior', field: 'wideAisles', label: 'Are aisles and pathways wide and uncluttered?', options: STANDARD_ANSWERS },
    { section: 'interior', field: 'seatingInside', label: 'Are there places to sit and rest inside?', options: YES_NO_UNSURE },
    { section: 'interior', field: 'elevatorOrLift', label: 'If there are multiple floors, is there an elevator or lift?', options: ELEVATOR_OPTIONS },
  ],
  washroom: [
    { section: 'washroom', field: 'customerWashroom', label: 'Is there a customer washroom?', options: CUSTOMER_WASHROOM },
    {
      section: 'washroom',
      field: 'wheelchairAccessible',
      label: 'Is at least one washroom wheelchair accessible?',
      options: STANDARD_ANSWERS,
    },
    { section: 'washroom', field: 'grabBars', label: 'Are grab bars installed?', options: YES_NO_UNSURE },
    {
      section: 'washroom',
      field: 'turningSpace',
      label: 'Is there enough turning space for mobility devices?',
      options: TURNING_SPACE,
    },
  ],
  communication: [
    {
      section: 'communication',
      field: 'textEmailOnlineContact',
      label: 'Can customers contact you by text, email, or online?',
      options: LIMITED_YES,
    },
    {
      section: 'communication',
      field: 'largePrintDigitalForms',
      label: 'Do you offer large-print or digital menus/forms?',
      options: BY_REQUEST,
    },
    {
      section: 'communication',
      field: 'reasonableNoise',
      label: 'Is background noise usually reasonable?',
      options: NOISE_OPTIONS,
    },
    {
      section: 'communication',
      field: 'staffAssistance',
      label: 'Are staff comfortable helping customers with accessibility needs?',
      options: STAFF_OPTIONS,
    },
  ],
  sensory: [
    { section: 'sensory', field: 'comfortableLighting', label: 'Is lighting comfortable and not overly harsh?', options: STANDARD_ANSWERS },
    { section: 'sensory', field: 'easyToNavigate', label: 'Is the space easy to navigate?', options: BUSY_OPTIONS },
    {
      section: 'sensory',
      field: 'extraTimeSupport',
      label: 'Are staff willing to give customers extra time or support?',
      options: SOMETIMES_OPTIONS,
    },
    { section: 'sensory', field: 'serviceAnimalsWelcome', label: 'Are service animals welcome?', options: YES_NO_UNSURE },
  ],
  transport: [
    { section: 'transport', field: 'accessibleParkingNearby', label: 'Is accessible parking nearby?', options: STANDARD_ANSWERS },
    { section: 'transport', field: 'safeDropOff', label: 'Is there a safe drop-off area near the entrance?', options: STANDARD_ANSWERS },
    { section: 'transport', field: 'publicTransitNearby', label: 'Is the business near public transit?', options: STANDARD_ANSWERS },
  ],
};

export function getSectionValue(
  profile: AccessibilityProfile,
  section: ProfileSectionKey,
  field: string
): string | undefined {
  const block = profile[section] as Record<string, string | undefined> | undefined;
  return block?.[field];
}

export function patchSectionField(
  profile: AccessibilityProfile,
  section: ProfileSectionKey,
  field: string,
  value: string
): AccessibilityProfile {
  return {
    ...profile,
    [section]: {
      ...(profile[section] as object),
      [field]: value,
    },
  };
}
