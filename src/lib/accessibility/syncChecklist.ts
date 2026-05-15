import type { AccessibilityChecklist } from '@/models/Place';
import type { AccessibilityProfile } from '@/models/AccessibilityProfile';

function yesOrPartial(answer?: string): boolean {
  return answer === 'yes' || answer === 'partial' || answer === 'limited' || answer === 'assisted';
}

/** Map outreach profile answers onto the legacy boolean checklist for scoring. */
export function profileToChecklist(profile: AccessibilityProfile): Partial<AccessibilityChecklist> {
  const e = profile.entrance ?? {};
  const i = profile.interior ?? {};
  const w = profile.washroom ?? {};
  const c = profile.communication ?? {};
  const s = profile.sensory ?? {};
  const t = profile.transport ?? {};
  const extras = new Set(profile.extraFeatures ?? []);

  return {
    levelEntrance: yesOrPartial(e.stepFree),
    entranceRamp: yesOrPartial(e.ramp),
    automaticDoor: e.automaticDoor === 'yes' || e.automaticDoor === 'assisted',
    wideAisles: yesOrPartial(i.wideAisles),
    elevator: i.elevatorOrLift === 'yes' || i.elevatorOrLift === 'limited',
    accessibleSeating: extras.has('accessible_seating') || yesOrPartial(i.wheelchairMovement),
    accessibleWashroom: yesOrPartial(w.wheelchairAccessible),
    genderNeutralWashroom: extras.has('gender_neutral_washroom'),
    accessibleParking: yesOrPartial(t.accessibleParkingNearby),
    transitAccessible: yesOrPartial(t.publicTransitNearby),
    serviceAnimalWelcome: s.serviceAnimalsWelcome === 'yes',
    quietSpace: extras.has('quiet_hours') || c.reasonableNoise === 'yes',
    brailleSignage: extras.has('visual_signage'),
    audioAnnouncements: false,
  };
}
