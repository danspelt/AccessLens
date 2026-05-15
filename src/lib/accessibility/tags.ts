import type { AccessibilityProfile, ExtraFeature } from '@/models/AccessibilityProfile';
import { EXTRA_FEATURE_LABELS } from '@/models/AccessibilityProfile';

export type PublicTagStatus = 'positive' | 'partial' | 'negative' | 'neutral';

export interface PublicAccessibilityTag {
  id: string;
  label: string;
  status: PublicTagStatus;
}

function isPositive(answer?: string): boolean {
  return answer === 'yes' || answer === 'assisted' || answer === 'by_request';
}

function isPartial(answer?: string): boolean {
  return (
    answer === 'partial' ||
    answer === 'limited' ||
    answer === 'sometimes' ||
    answer === 'busy_at_times' ||
    answer === 'sometimes_loud' ||
    answer === 'some_staff' ||
    answer === 'by_request'
  );
}

function tag(
  id: string,
  label: string,
  answer: string | undefined,
  positiveAnswers: string[] = ['yes', 'assisted']
): PublicAccessibilityTag | null {
  if (!answer || answer === 'unsure' || answer === 'planned') {
    if (answer === 'planned') {
      return { id, label: `${label} (planned)`, status: 'neutral' };
    }
    return null;
  }
  if (positiveAnswers.includes(answer)) {
    return { id, label, status: 'positive' };
  }
  if (isPartial(answer)) {
    return { id, label: `${label} (limited)`, status: 'partial' };
  }
  if (answer === 'no' || answer === 'single_floor') {
    return null;
  }
  return null;
}

const EXTRA_TAG_MAP: Partial<Record<ExtraFeature, string>> = {
  quiet_hours: 'Quiet hours',
  assistance_on_request: 'Assistance upon request',
  delivery_curbside: 'Curbside pickup',
  accessible_seating: 'Accessible seating',
  gender_neutral_washroom: 'Gender-neutral washroom',
  multilingual_support: 'Multilingual support',
};

/** Convert a business accessibility profile into clean public-facing tags. */
export function profileToPublicTags(profile: AccessibilityProfile | undefined): PublicAccessibilityTag[] {
  if (!profile) return [];

  const tags: PublicAccessibilityTag[] = [];

  const push = (t: PublicAccessibilityTag | null) => {
    if (t) tags.push(t);
  };

  push(tag('step_free', 'Step-free entry', profile.entrance?.stepFree));
  push(tag('ramp', 'Ramp available', profile.entrance?.ramp));
  push(tag('wide_door', 'Wide entrance', profile.entrance?.wideDoor));
  push(tag('automatic_door', 'Automatic door', profile.entrance?.automaticDoor, ['yes', 'assisted']));
  push(tag('smooth_path', 'Smooth path to entrance', profile.entrance?.smoothPath));
  push(tag('wheelchair_interior', 'Wheelchair-friendly interior', profile.interior?.wheelchairMovement));
  push(tag('wide_aisles', 'Wide interior paths', profile.interior?.wideAisles));
  push(tag('elevator', 'Elevator access', profile.interior?.elevatorOrLift, ['yes', 'limited']));
  push(tag('accessible_washroom', 'Accessible washroom', profile.washroom?.wheelchairAccessible));
  push(tag('grab_bars', 'Grab bars in washroom', profile.washroom?.grabBars));
  push(tag('staff_assistance', 'Staff assistance available', profile.communication?.staffAssistance, [
    'yes',
    'some_staff',
  ]));
  push(tag('large_print', 'Large-print or digital menus', profile.communication?.largePrintDigitalForms, [
    'yes',
    'by_request',
  ]));
  push(tag('quiet', 'Reasonable noise level', profile.communication?.reasonableNoise));
  push(tag('service_animals', 'Service animals welcome', profile.sensory?.serviceAnimalsWelcome));
  push(tag('parking', 'Accessible parking nearby', profile.transport?.accessibleParkingNearby));
  push(tag('drop_off', 'Safe drop-off area', profile.transport?.safeDropOff));
  push(tag('transit', 'Public transit nearby', profile.transport?.publicTransitNearby));
  push(tag('comfortable_lighting', 'Comfortable lighting', profile.sensory?.comfortableLighting));
  push(tag('easy_navigate', 'Easy to navigate', profile.sensory?.easyToNavigate, ['yes']));
  push(tag('extra_time', 'Extra time & support', profile.sensory?.extraTimeSupport, ['yes', 'sometimes']));
  push(tag('digital_contact', 'Text/email/online contact', profile.communication?.textEmailOnlineContact, [
    'yes',
    'limited',
  ]));
  push(tag('seating_entrance', 'Seating near entrance', profile.entrance?.seatingNearEntrance));
  push(tag('seating_inside', 'Seating inside', profile.interior?.seatingInside));

  for (const feature of profile.extraFeatures ?? []) {
    const label = EXTRA_TAG_MAP[feature] ?? EXTRA_FEATURE_LABELS[feature];
    if (label) {
      tags.push({ id: `extra_${feature}`, label, status: 'positive' });
    }
  }

  return tags;
}

export const VERIFICATION_LABELS = {
  business_submitted: 'Business submitted',
  student_verified: 'Student verified',
  community_verified: 'Community verified',
} as const;

export type VerificationLevel = keyof typeof VERIFICATION_LABELS;
