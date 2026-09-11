import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Users,
  Building2,
  Heart,
  ArrowRight,
  Camera,
  ClipboardCheck,
  MessageSquare,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { PublicHero } from '@/components/layout/PublicHero';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Our Community Accessibility Map',
  description:
    'Learn how AccessLens combines accessibility checklists, photos, reviews, and a public map to help people find accessible places in Victoria and Vancouver, BC.',
  path: '/about',
});

const PILLARS = [
  {
    icon: ClipboardCheck,
    title: 'Detailed checklists',
    text: 'Ramps, automatic doors, washrooms, elevators, parking, sensory notes — the details people actually need.',
  },
  {
    icon: Camera,
    title: 'Photo evidence',
    text: 'See entrances and features before you arrive, contributed by the community and participating businesses.',
  },
  {
    icon: MessageSquare,
    title: 'Lived experience',
    text: 'Reviews and barrier reports from people who use these spaces — not marketing copy alone.',
  },
];

export default function AboutPage() {
  return (
    <div>
      <PublicHero
        title="Know before you go"
        description="We help communities document and share real-world accessibility information for places in Victoria and Vancouver — so people can plan visits with more confidence."
      />

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8" aria-labelledby="what-heading">
        <p className="eyebrow text-center">What we map</p>
        <h2
          id="what-heading"
          className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          Accessibility intelligence for real streets
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
          AccessLens combines checklists, photos, community reviews, and a public map. Built for people
          with disabilities, seniors, families, and anyone who wants clearer information before visiting.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl panel-surface p-6">
              <span className="orb-3d mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-primary-700">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100/80 bg-white/50 py-16" aria-labelledby="outreach-heading">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <span className="orb-3d flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-primary-700">
              <Users className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">Victoria pilot</p>
              <h2
                id="outreach-heading"
                className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
              >
                Community outreach, not red tape
              </h2>
            </div>
          </div>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Student ambassadors visit local businesses with QR cards and simple six-digit codes. Owners
            update their listing in minutes — no audit, no complicated signup. Participating businesses
            are recognized as Accessibility Partners on the map.
          </p>
          <Link
            href="/for-businesses"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-primary-700 hover:text-primary-800"
          >
            How businesses join
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="py-16" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Heart className="mx-auto mb-4 h-9 w-9 text-primary-600" aria-hidden="true" />
          <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-slate-900">
            Explore, contribute, or partner
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            The map is live. Browse anonymously, join as a community reviewer, or update a business
            listing with your access code.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/explore" className="link-cta-primary gap-2 px-8 py-4 text-base">
              <MapPin className="h-5 w-5" aria-hidden="true" />
              Explore the map
            </Link>
            <Link href="/update-accessibility" className="link-cta-outline gap-2 px-8 py-4 text-base">
              <Building2 className="h-5 w-5" aria-hidden="true" />
              Business update portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
