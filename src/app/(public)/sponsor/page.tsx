import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, CheckCircle, Handshake, Heart, MapPin } from 'lucide-react';
import { SPONSOR_TIERS, stripeConfigured, type SponsorTier } from '@/lib/sponsorship';
import { SponsorButton } from './SponsorButtons';

export const metadata: Metadata = {
  title: 'Sponsor AccessLens — Keep Victoria Accessible',
  description:
    'Become an AccessLens sponsor. Your support funds student ambassadors who verify accessibility information across Victoria, BC.',
};

const TIER_ORDER: SponsorTier[] = ['community', 'supporter'];

const WHAT_IT_FUNDS = [
  'Student ambassadors visiting businesses to confirm accessibility details',
  'QR card printing and placement across Victoria neighbourhoods',
  'Photo verification and data freshness reviews',
  'Keeping the public accessibility map free for everyone, forever',
];

export default function SponsorPage() {
  const configured = stripeConfigured();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="pointer-events-none absolute -right-40 top-0 h-[36rem] w-[36rem] rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            <Heart className="h-4 w-4 text-primary-200" aria-hidden="true" />
            Community-funded accessibility
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Sponsor AccessLens
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-primary-100">
            Your sponsorship pays local students to verify accessibility information at real
            Victoria businesses — and keeps the map free for everyone who needs it.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8" aria-labelledby="tiers-heading">
        <h2 id="tiers-heading" className="sr-only">
          Sponsorship tiers
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {TIER_ORDER.map((tier) => {
            const info = SPONSOR_TIERS[tier];
            return (
              <div
                key={tier}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900">{info.label}</h3>
                <p className="mt-2 text-4xl font-bold text-primary-700">
                  {info.amount}
                  <span className="ml-1 text-base font-semibold text-slate-500">
                    CAD {info.cadence}
                  </span>
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{info.blurb}</p>
                <div className="mt-6">
                  {configured ? (
                    <SponsorButton tier={tier} />
                  ) : (
                    <a
                      href="mailto:hello@accesslens.ca?subject=AccessLens%20sponsorship"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary-700"
                    >
                      <Handshake className="h-5 w-5" aria-hidden="true" />
                      Email us to sponsor
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Secure payment via Stripe. Cancel a monthly sponsorship anytime. Sponsorship never
          influences accessibility scores or listings.
        </p>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-16" aria-labelledby="funds-heading">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="eyebrow text-center">Where the money goes</p>
          <h2
            id="funds-heading"
            className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900"
          >
            Every dollar funds verified accessibility data
          </h2>
          <ul className="mt-8 space-y-3" role="list">
            {WHAT_IT_FUNDS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-sm text-slate-500">
            Prefer to talk first?{' '}
            <a href="mailto:hello@accesslens.ca" className="font-medium text-primary-600 hover:underline">
              hello@accesslens.ca
            </a>{' '}
            ·{' '}
            <Link href="/pitch" className="font-medium text-primary-600 hover:underline">
              Read the full initiative pitch
            </Link>
          </p>
        </div>
      </section>

      <section className="py-12" aria-label="Explore AccessLens">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
          >
            <MapPin className="h-5 w-5 text-primary-600" aria-hidden="true" />
            Explore the live map
          </Link>
        </div>
      </section>
    </div>
  );
}
