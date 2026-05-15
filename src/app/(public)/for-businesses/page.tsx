import type { Metadata } from 'next';
import Link from 'next/link';
import { QrCode, Heart, MapPin, Award, ArrowRight } from 'lucide-react';
import { PARTNER_LABEL_DISPLAY } from '@/models/Place';

export const metadata: Metadata = {
  title: 'For Businesses — AccessLens',
  description:
    'Join the Victoria community accessibility project. Update your listing in minutes with a simple code — no audit, no account required.',
};

export default function ForBusinessesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            Community accessibility project
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            Show customers what access looks like before they arrive
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
            AccessLens is not an inspection or compliance audit. It is a free, community-driven way
            to help people with disabilities, seniors, and families find places they can visit with
            confidence — and to recognize businesses that participate.
          </p>
          <Link
            href="/update-accessibility"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary-500 to-primary-700 px-8 py-4 text-base font-semibold text-white shadow-btn-primary ring-1 ring-white/15 hover:from-primary-500 hover:to-primary-600"
          >
            <QrCode className="h-5 w-5" aria-hidden="true" />
            I have my six-digit code
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
        <ol className="mt-6 space-y-6">
          {[
            {
              step: '1',
              title: 'Student ambassadors visit',
              text: 'A local student leaves a QR card and a simple six-digit code — takes about two minutes to explain.',
            },
            {
              step: '2',
              title: 'You update on any phone or tablet',
              text: 'Large buttons, plain language, no password. Add notes and photos if you want.',
            },
            {
              step: '3',
              title: 'You are listed as a partner',
              text: `Published businesses receive the "${PARTNER_LABEL_DISPLAY.accessibility_partner}" badge on the public map.`,
            },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-800">
                {item.step}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-slate-600">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">Why participate?</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, title: 'Visibility', text: 'Reach customers searching for accessible places.' },
              { icon: Heart, title: 'Trust', text: 'Real notes and photos — not generic icons.' },
              { icon: Award, title: 'Recognition', text: 'Positive marketing, not a scorecard.' },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-slate-200 p-5">
                <Icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-sm text-slate-500">
            Questions?{' '}
            <Link href="/explore" className="font-semibold text-primary-600 hover:underline">
              Explore the map
            </Link>{' '}
            or contact your local AccessLens coordinator.
          </p>
        </div>
      </section>
    </div>
  );
}
