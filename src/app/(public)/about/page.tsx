import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Users, Building2, Heart, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About AccessLens',
  description:
    'AccessLens is a community-driven accessibility map for Victoria, BC — helping people know before they go.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">About AccessLens</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
            We help communities document, improve, and share real-world accessibility information so
            people can choose where to go with confidence.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-10">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Heart className="h-5 w-5 text-primary-600" aria-hidden="true" />
            Know before you go
          </h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            AccessLens combines accessibility checklists, photos, community reviews, and a public map.
            It is built for people with disabilities, seniors, families, and anyone who wants clearer
            information before visiting a business or public place.
          </p>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Users className="h-5 w-5 text-primary-600" aria-hidden="true" />
            Community outreach program
          </h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            In Victoria, student ambassadors visit local businesses with QR cards and simple six-digit
            codes. Owners update their listing in minutes — no audit, no complicated signup. Participating
            businesses are recognized as Accessibility Partners on the map.
          </p>
          <Link
            href="/for-businesses"
            className="mt-4 inline-flex items-center gap-2 font-semibold text-primary-600 hover:underline"
          >
            For businesses
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Explore the map
          </Link>
          <Link
            href="/update-accessibility"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Business update portal
          </Link>
        </div>
      </section>
    </div>
  );
}
