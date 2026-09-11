import type { Metadata } from 'next';
import Link from 'next/link';
import {
  QrCode,
  Heart,
  MapPin,
  Award,
  ArrowRight,
  Smartphone,
  CheckCircle,
} from 'lucide-react';
import { PARTNER_LABEL_DISPLAY } from '@/models/Place';
import { buildPageMetadata } from '@/lib/seo';
import { PublicHero } from '@/components/layout/PublicHero';

export const metadata: Metadata = buildPageMetadata({
  title: 'Accessibility Listings for Victoria Businesses',
  description:
    'Help customers understand your Victoria business before they arrive. Add entrance, washroom, parking, sensory, and mobility details to your free AccessLens listing.',
  path: '/for-businesses',
});

const STEPS = [
  {
    step: '1',
    title: 'A student ambassador visits',
    text: 'They leave a QR card and a simple six-digit code — about two minutes to explain.',
  },
  {
    step: '2',
    title: 'You update on any phone',
    text: 'Large buttons, plain language, no password. Add notes and photos if you want.',
  },
  {
    step: '3',
    title: 'You appear as a partner',
    text: `Published businesses receive the "${PARTNER_LABEL_DISPLAY.accessibility_partner}" badge on the map.`,
  },
];

const BENEFITS = [
  { icon: MapPin, title: 'Visibility', text: 'Reach customers searching for accessible places.' },
  { icon: Heart, title: 'Trust', text: 'Real notes and photos — not generic icons.' },
  { icon: Award, title: 'Recognition', text: 'Positive marketing, not a scorecard.' },
];

export default function ForBusinessesPage() {
  return (
    <div>
      <PublicHero
        eyebrow="Free Victoria QR pilot"
        title="Share how accessible your business really is"
        description="Not an inspection — a free listing so customers know before they go, and participating businesses get recognized on the map."
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/update-accessibility"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-primary-900 shadow-lg transition-colors hover:bg-primary-50"
          >
            <QrCode className="h-5 w-5" aria-hidden="true" />
            I have my six-digit code
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            See the live map
          </Link>
        </div>
      </PublicHero>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8" aria-labelledby="how-heading">
        <p className="eyebrow text-center">Simple by design</p>
        <h2
          id="how-heading"
          className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          How it works
        </h2>
        <ol className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ step, title, text }) => (
            <li key={step} className="rounded-2xl panel-surface p-6">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-primary-400 to-primary-700 text-lg font-bold text-white shadow-orb">
                {step}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-2xl border border-primary-200 bg-primary-50/80 p-6 sm:flex sm:items-center sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
            <Smartphone className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="mt-4 sm:mt-0">
            <p className="font-semibold text-primary-900">Already have a code?</p>
            <p className="mt-1 text-sm text-primary-800">
              Open{' '}
              <Link href="/update-accessibility" className="font-bold underline underline-offset-2">
                the business update portal
              </Link>{' '}
              — no account required.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100/80 bg-white/50 py-16" aria-labelledby="why-heading">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <p className="eyebrow text-center">Why participate</p>
          <h2
            id="why-heading"
            className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Built for customers who need clarity
          </h2>
          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl panel-surface p-6">
                <span className="orb-3d mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-primary-700">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
          <ul className="mx-auto mt-10 max-w-xl space-y-3" role="list">
            {[
              'Free to join during the Victoria pilot',
              'Owner-confirmed details, not guessed icons',
              'You control what gets published',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-700">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-slate-900">
            Ready to update your listing?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Enter your six-digit code, or explore the map to see how partners appear.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/update-accessibility" className="link-cta-primary gap-2 px-8 py-4 text-base">
              <QrCode className="h-5 w-5" aria-hidden="true" />
              Enter my code
            </Link>
            <Link href="/explore" className="link-cta-outline gap-2 px-8 py-4 text-base">
              Browse the map
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            Questions?{' '}
            <a href="mailto:hello@accesslens.ca" className="font-semibold text-primary-600 hover:underline">
              hello@accesslens.ca
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
