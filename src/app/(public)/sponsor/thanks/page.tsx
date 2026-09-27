import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Thank you — AccessLens Sponsor',
  description: 'Thank you for sponsoring AccessLens and keeping accessibility data free for Victoria.',
};

export default function SponsorThanksPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
      <CheckCircle className="mx-auto mb-6 h-14 w-14 text-green-500" aria-hidden="true" />
      <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Thank you for sponsoring AccessLens
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
        Your support directly funds student ambassadors verifying accessibility information
        across Victoria. You&apos;ll receive a receipt from Stripe by email, and we&apos;ll be
        in touch about sponsor recognition.
      </p>
      <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
        Sponsorship never influences accessibility scores — it keeps the data free and current.
      </p>
      <div className="mt-10">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-primary-700"
        >
          <MapPin className="h-5 w-5" aria-hidden="true" />
          Explore the map you support
        </Link>
      </div>
    </div>
  );
}
