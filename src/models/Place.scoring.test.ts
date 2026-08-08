import { describe, expect, it } from 'vitest';
import {
  calculateAccessibilityScore,
  getScoreColor,
  getScoreLabel,
} from '@/models/Place';

const allTrue = {
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
} as const;

describe('calculateAccessibilityScore', () => {
  it('returns 0 when all scored fields are false/missing', () => {
    expect(calculateAccessibilityScore({})).toBe(0);
    expect(
      calculateAccessibilityScore({
        entranceRamp: false,
        automaticDoor: false,
        levelEntrance: false,
        elevator: false,
        wideAisles: false,
        accessibleWashroom: false,
        accessibleParking: false,
        transitAccessible: false,
        brailleSignage: false,
        serviceAnimalWelcome: false,
      })
    ).toBe(0);
  });

  it('returns 100 when all scored fields are true', () => {
    expect(calculateAccessibilityScore(allTrue)).toBe(100);
  });

  it('rounds partial scores', () => {
    expect(calculateAccessibilityScore({ entranceRamp: true })).toBe(10);
    expect(
      calculateAccessibilityScore({
        entranceRamp: true,
        automaticDoor: true,
        levelEntrance: true,
      })
    ).toBe(30);
  });
});

describe('getScoreColor / getScoreLabel boundaries', () => {
  it('uses red below 40', () => {
    expect(getScoreColor(0)).toBe('red');
    expect(getScoreColor(39)).toBe('red');
    expect(getScoreLabel(39)).toBe('Accessibility Barriers');
  });

  it('uses yellow from 40 inclusive to 69', () => {
    expect(getScoreColor(40)).toBe('yellow');
    expect(getScoreColor(69)).toBe('yellow');
    expect(getScoreLabel(40)).toBe('Partially Accessible');
    expect(getScoreLabel(69)).toBe('Partially Accessible');
  });

  it('uses green from 70 inclusive', () => {
    expect(getScoreColor(70)).toBe('green');
    expect(getScoreColor(100)).toBe('green');
    expect(getScoreLabel(70)).toBe('Highly Accessible');
  });
});
