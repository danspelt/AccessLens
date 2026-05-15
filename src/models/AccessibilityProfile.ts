/** Granular accessibility answers for business outreach updates */

export type AccessibilityAnswer =
  | 'yes'
  | 'partial'
  | 'no'
  | 'unsure'
  | 'planned';

export type DoorAnswer = 'yes' | 'assisted' | 'no' | 'unsure';

export type ElevatorAnswer = 'yes' | 'limited' | 'no' | 'single_floor';

export type LimitedAnswer = 'yes' | 'limited' | 'no';

export type ByRequestAnswer = 'yes' | 'by_request' | 'no';

export type NoiseAnswer = 'yes' | 'sometimes_loud' | 'no' | 'unsure';

export type StaffAnswer = 'yes' | 'some_staff' | 'no' | 'unsure';

export type SometimesAnswer = 'yes' | 'sometimes' | 'no' | 'unsure';

export type BusyAnswer = 'yes' | 'busy_at_times' | 'no' | 'unsure';

export type TurningSpaceAnswer = 'yes' | 'limited' | 'no' | 'unsure';

export type ExtraFeature =
  | 'quiet_hours'
  | 'staff_training'
  | 'accessible_website'
  | 'assistance_on_request'
  | 'delivery_curbside'
  | 'online_booking'
  | 'accessible_seating'
  | 'gender_neutral_washroom'
  | 'visual_signage'
  | 'multilingual_support';

export interface AccessibilityProfile {
  entrance?: {
    stepFree?: AccessibilityAnswer;
    ramp?: AccessibilityAnswer;
    wideDoor?: AccessibilityAnswer;
    automaticDoor?: DoorAnswer;
    smoothPath?: AccessibilityAnswer;
    seatingNearEntrance?: 'yes' | 'no' | 'unsure';
  };
  interior?: {
    wheelchairMovement?: AccessibilityAnswer;
    wideAisles?: AccessibilityAnswer;
    seatingInside?: 'yes' | 'no' | 'unsure';
    elevatorOrLift?: ElevatorAnswer;
  };
  washroom?: {
    customerWashroom?: 'yes' | 'no';
    wheelchairAccessible?: AccessibilityAnswer;
    grabBars?: 'yes' | 'no' | 'unsure';
    turningSpace?: TurningSpaceAnswer;
  };
  communication?: {
    textEmailOnlineContact?: LimitedAnswer;
    largePrintDigitalForms?: ByRequestAnswer;
    reasonableNoise?: NoiseAnswer;
    staffAssistance?: StaffAnswer;
  };
  sensory?: {
    comfortableLighting?: AccessibilityAnswer;
    easyToNavigate?: BusyAnswer;
    extraTimeSupport?: SometimesAnswer;
    serviceAnimalsWelcome?: 'yes' | 'no' | 'unsure';
  };
  transport?: {
    accessibleParkingNearby?: AccessibilityAnswer;
    safeDropOff?: AccessibilityAnswer;
    publicTransitNearby?: AccessibilityAnswer;
  };
  extraFeatures?: ExtraFeature[];
  publicNotes?: string;
}

export const EXTRA_FEATURE_LABELS: Record<ExtraFeature, string> = {
  quiet_hours: 'Quiet hours',
  staff_training: 'Staff accessibility training',
  accessible_website: 'Accessible website',
  assistance_on_request: 'Assistance upon request',
  delivery_curbside: 'Delivery / curbside pickup',
  online_booking: 'Online booking',
  accessible_seating: 'Accessible seating',
  gender_neutral_washroom: 'Gender-neutral washroom',
  visual_signage: 'Clear visual signage',
  multilingual_support: 'Multilingual support',
};
