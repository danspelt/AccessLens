export type SponsorTier = 'community' | 'supporter';

export const SPONSOR_TIERS: Record<
  SponsorTier,
  { label: string; amount: string; cadence: string; blurb: string }
> = {
  community: {
    label: 'Community Sponsor',
    amount: '$1,000',
    cadence: 'per year',
    blurb:
      'Founding-partner sponsorship. Funds a full round of student-ambassador outreach visits and keeps the Victoria accessibility dataset free for everyone.',
  },
  supporter: {
    label: 'Supporting Sponsor',
    amount: '$100',
    cadence: 'per month',
    blurb:
      'Ongoing monthly support that keeps ambassador visits, photo verification, and data maintenance running.',
  },
};

export function priceIdForTier(tier: SponsorTier): string | null {
  if (tier === 'community') return process.env.STRIPE_PRICE_SPONSOR_ANNUAL ?? null;
  return process.env.STRIPE_PRICE_SUPPORTER_MONTHLY ?? null;
}

export function tierForPriceId(priceId: string): SponsorTier | null {
  if (process.env.STRIPE_PRICE_SPONSOR_ANNUAL === priceId) return 'community';
  if (process.env.STRIPE_PRICE_SUPPORTER_MONTHLY === priceId) return 'supporter';
  return null;
}

export function isSponsorTier(value: unknown): value is SponsorTier {
  return value === 'community' || value === 'supporter';
}

export function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_SPONSOR_ANNUAL &&
      process.env.STRIPE_PRICE_SUPPORTER_MONTHLY,
  );
}
