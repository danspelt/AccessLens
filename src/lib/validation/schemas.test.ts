import { describe, expect, it } from 'vitest';
import { loginSchema, reviewSchema, signupSchema } from '@/lib/validation/schemas';
import { profileToChecklist } from '@/lib/accessibility/syncChecklist';
import { profileToPublicTags, VERIFICATION_LABELS } from '@/lib/accessibility/tags';
import type { AccessibilityProfile } from '@/models/AccessibilityProfile';

describe('Zod schemas', () => {
  it('accepts valid signup payloads', () => {
    const parsed = signupSchema.parse({
      email: 'user@example.com',
      password: 'password1',
      name: 'Test User',
      accountType: 'reviewer',
    });
    expect(parsed.email).toBe('user@example.com');
  });

  it('rejects short passwords', () => {
    expect(() =>
      signupSchema.parse({
        email: 'user@example.com',
        password: 'short',
        name: 'Test',
        accountType: 'reviewer',
      })
    ).toThrow();
  });

  it('validates login and review shapes', () => {
    expect(loginSchema.parse({ email: 'a@b.co', password: 'x' }).email).toBe('a@b.co');
    expect(reviewSchema.parse({ rating: 4, comment: 'Great access' }).rating).toBe(4);
  });
});

describe('syncChecklist / tags', () => {
  const profile: AccessibilityProfile = {
    entrance: { stepFree: 'yes', ramp: 'yes', automaticDoor: 'yes', wideDoor: 'yes' },
    interior: { wideAisles: 'yes', elevatorOrLift: 'yes', wheelchairMovement: 'yes' },
    washroom: { wheelchairAccessible: 'yes', grabBars: 'yes' },
    communication: { staffAssistance: 'yes', reasonableNoise: 'yes' },
    sensory: { serviceAnimalsWelcome: 'yes' },
    transport: { accessibleParkingNearby: 'yes', publicTransitNearby: 'yes' },
    extraFeatures: ['accessible_seating', 'quiet_hours'],
  };

  it('maps profile answers onto checklist booleans', () => {
    const checklist = profileToChecklist(profile);
    expect(checklist.levelEntrance).toBe(true);
    expect(checklist.entranceRamp).toBe(true);
    expect(checklist.elevator).toBe(true);
    expect(checklist.accessibleWashroom).toBe(true);
    expect(checklist.serviceAnimalWelcome).toBe(true);
  });

  it('emits public tags for positive answers', () => {
    const tags = profileToPublicTags(profile);
    expect(tags.some((t) => t.id === 'step_free' && t.status === 'positive')).toBe(true);
    expect(tags.some((t) => t.id === 'extra_quiet_hours')).toBe(true);
  });

  it('exposes verification labels', () => {
    expect(VERIFICATION_LABELS.community_verified).toMatch(/Community/);
  });
});
