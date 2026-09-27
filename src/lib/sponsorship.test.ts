import { afterEach, describe, expect, it } from 'vitest';
import {
  SPONSOR_TIERS,
  isSponsorTier,
  priceIdForTier,
  stripeConfigured,
  tierForPriceId,
} from './sponsorship';

const ENV_KEYS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_SPONSOR_ANNUAL',
  'STRIPE_PRICE_SUPPORTER_MONTHLY',
];

const saved: Record<string, string | undefined> = {};

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

function setPrices() {
  for (const key of ENV_KEYS) saved[key] = process.env[key];
  process.env.STRIPE_SECRET_KEY = 'rk_test_key';
  process.env.STRIPE_PRICE_SPONSOR_ANNUAL = 'price_annual';
  process.env.STRIPE_PRICE_SUPPORTER_MONTHLY = 'price_monthly';
}

describe('sponsorship tiers', () => {
  it('defines community and supporter tiers with labels and amounts', () => {
    expect(SPONSOR_TIERS.community.label).toBe('Community Sponsor');
    expect(SPONSOR_TIERS.supporter.label).toBe('Supporting Sponsor');
    expect(SPONSOR_TIERS.community.cadence).toBe('per year');
    expect(SPONSOR_TIERS.supporter.cadence).toBe('per month');
  });

  it('validates tier names strictly', () => {
    expect(isSponsorTier('community')).toBe(true);
    expect(isSponsorTier('supporter')).toBe(true);
    expect(isSponsorTier('gold')).toBe(false);
    expect(isSponsorTier(undefined)).toBe(false);
    expect(isSponsorTier(42)).toBe(false);
  });

  it('maps tiers to configured price ids', () => {
    setPrices();
    expect(priceIdForTier('community')).toBe('price_annual');
    expect(priceIdForTier('supporter')).toBe('price_monthly');
  });

  it('maps configured price ids back to tiers', () => {
    setPrices();
    expect(tierForPriceId('price_annual')).toBe('community');
    expect(tierForPriceId('price_monthly')).toBe('supporter');
    expect(tierForPriceId('price_other')).toBeNull();
  });

  it('reports stripe as configured only when key and both prices exist', () => {
    for (const key of ENV_KEYS) saved[key] = process.env[key];
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRICE_SPONSOR_ANNUAL;
    delete process.env.STRIPE_PRICE_SUPPORTER_MONTHLY;
    expect(stripeConfigured()).toBe(false);
    setPrices();
    expect(stripeConfigured()).toBe(true);
  });
});
