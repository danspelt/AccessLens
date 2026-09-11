import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  QrCode,
  Building2,
  Users,
  CheckCircle,
  ArrowRight,
  Heart,
  TrendingUp,
  Award,
  DollarSign,
  Globe,
  Smartphone,
  BarChart3,
  Handshake,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AccessLens — Victoria Accessibility Mapping Initiative',
  description:
    'A community-funded, self-sustaining accessibility map for Victoria, BC. Powered by local businesses, not government dollars.',
};

const STATS = [
  { label: 'Neighbourhoods mapped', value: '20+', icon: MapPin },
  { label: 'QR location codes active', value: '20', icon: QrCode },
  { label: 'Founding partners', value: 'Growing', note: 'Victoria pilot', icon: Building2 },
  { label: 'Cost to government', value: '$0', note: 'community-funded model', icon: DollarSign },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Student ambassador visits a business',
    body: 'A local student leaves a physical QR card and a unique six-digit access code — the whole visit takes under five minutes.',
  },
  {
    step: '2',
    title: 'Owner updates their listing on any phone',
    body: 'Large buttons, plain language, no password required. Owners answer a checklist: ramp, automatic door, accessible washroom, elevator, and more.',
  },
  {
    step: '3',
    title: 'Information is live on the public map',
    body: 'Anyone searching for accessible places in Victoria can find the business instantly, with verified, up-to-date accessibility details.',
  },
  {
    step: '4',
    title: 'Business earns the Accessibility Partner badge',
    body: 'Participating businesses are publicly recognised and rewarded with increased visibility for customers who need accessible spaces.',
  },
];

const BUSINESS_MODEL = [
  {
    icon: Building2,
    title: 'Business partners fund the outreach',
    body: 'A small number of founding partners cover student ambassador visits. Each partner subscription is designed to fund ~50 outreach visits — without a government grant.',
  },
  {
    icon: Users,
    title: 'Students earn while they contribute',
    body: 'Student ambassadors are compensated through the partner pool — real work experience, real community impact.',
  },
  {
    icon: TrendingUp,
    title: 'Self-sustaining at scale',
    body: 'As more businesses join, more ambassadors can be employed, covering more of Victoria. The model grows without external funding.',
  },
  {
    icon: Globe,
    title: 'Expandable to every BC city',
    body: 'The platform already supports multiple cities. Once Victoria proves the model, replication across the capital region and beyond is immediate.',
  },
];

const WHAT_GOVERNMENT_CAN_DO = [
  {
    title: 'Endorse the program',
    body: 'An official City of Victoria or Provincial endorsement costs nothing and signals trust to businesses, increasing subscription uptake.',
  },
  {
    title: 'Share QR code data with permitting',
    body: 'Building permit applicants could be encouraged (not required) to update their AccessLens listing as part of the accessible design checklist.',
  },
  {
    title: 'Link from accessibility.victoria.ca',
    body: 'A simple outbound link from city accessibility pages drives traffic and credibility at zero cost.',
  },
  {
    title: 'Feature in city communications',
    body: 'A mention in an Access Awareness Week press release or city newsletter reaches thousands of residents who would immediately benefit.',
  },
];

const QR_ZONES = [
  'Downtown Victoria', 'Inner Harbour', 'Old Town & Fan Tan Alley',
  'Cook Street Village', 'James Bay', 'Beacon Hill Park',
  'Fernwood Village', 'North Park', 'Fairfield',
  'Fort Street (Antique Row)', 'Oak Bay Village', 'Quadra–Hillside',
  'Burnside–Gorge', 'Uptown District', 'Mayfair Area',
  'Tillicum Corridor', 'Esquimalt Town Centre', 'Royal Jubilee area',
  'Victoria General area', 'Johnson Street Bridge area',
];

export default function PitchPage() {
  return (
    <div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="pointer-events-none absolute -right-40 top-0 h-[40rem] w-[40rem] rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-primary-200" aria-hidden="true" />
            Victoria, BC — 2026 Initiative
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Accessible Victoria.<br />
            <span className="text-primary-200">No Government Dollars.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-primary-100">
            AccessLens is a community-built, business-supported accessibility map covering Victoria.
            Local partners fund student ambassadors who visit and update listings.
            Everyone finds accessible places — for free.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-primary-900 shadow-lg transition-colors hover:bg-primary-50"
            >
              <MapPin className="h-5 w-5" aria-hidden="true" />
              See the live map
            </Link>
            <Link
              href="/update-accessibility"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <QrCode className="h-5 w-5" aria-hidden="true" />
              Try a business update
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-slate-200 bg-slate-50" aria-label="Key numbers">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map(({ label, value, note, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <Icon className="mx-auto mb-2 h-6 w-6 text-primary-600" aria-hidden="true" />
                <dd className="text-3xl font-bold tabular-nums text-slate-900">{value}</dd>
                <dt className="mt-1 text-sm font-medium text-slate-700">{label}</dt>
                {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── The problem ── */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8" aria-labelledby="problem-heading">
        <p className="eyebrow text-center">The gap</p>
        <h2 id="problem-heading" className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          People with disabilities can&apos;t plan a trip without calling ahead
        </h2>
        <div className="mt-8 space-y-4 text-lg leading-relaxed text-slate-600">
          <p>
            Victoria has hundreds of accessible businesses — but almost none of them have that information
            published in a single, reliable, searchable place. Google Maps shows a wheelchair icon sometimes.
            Yelp shows nothing. Calling ahead is exhausting and inconsistent.
          </p>
          <p>
            The result: people with mobility impairments, seniors, parents with strollers, and visitors
            with invisible disabilities either skip outings entirely or face unpleasant surprises at the door.
          </p>
          <p className="font-semibold text-slate-800">
            AccessLens fixes this — with real, owner-confirmed, up-to-date information at the neighbourhood level.
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-50 border-t border-slate-100 py-16" aria-labelledby="how-heading">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <p className="eyebrow text-center">The process</p>
          <h2 id="how-heading" className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-slate-600">
            A QR card, a six-digit code, and five minutes — that&apos;s all a business needs to get on the map.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white shadow">
                  {step}
                </div>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>

          {/* QR demo callout */}
          <div className="mt-10 rounded-2xl border border-primary-200 bg-primary-50 p-6 sm:flex sm:items-center sm:gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
              <Smartphone className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="mt-4 sm:mt-0">
              <p className="font-semibold text-primary-900">Try it yourself — no account needed</p>
              <p className="mt-1 text-sm text-primary-800">
                Go to{' '}
                <Link href="/update-accessibility" className="font-bold underline hover:no-underline">
                  accesslens.ca/update-accessibility
                </Link>
                , enter any six-digit demo code, and experience exactly what a business owner sees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Business model ── */}
      <section className="py-16" aria-labelledby="model-heading">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <p className="eyebrow text-center">Sustainability</p>
          <h2 id="model-heading" className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Self-funding, not grant-dependent
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-slate-600">
            Founding partners fund student ambassadors for neighbourhood outreach — so the city gets a
            living accessibility map without writing a cheque.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {BUSINESS_MODEL.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue snapshot */}
          <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-6 w-6 text-green-700" aria-hidden="true" />
              <h3 className="font-semibold text-green-900">Revenue model at a glance</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 text-center">
              {[
                { label: 'Starter plan', price: '$29/mo', note: 'for small businesses' },
                { label: 'Professional', price: '$79/mo', note: 'for multi-location' },
                { label: 'Break-even target', price: '~8 subscribers', note: 'covers full ops' },
              ].map(({ label, price, note }) => (
                <div key={label} className="rounded-xl border border-green-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{price}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Victoria coverage map ── */}
      <section className="border-t border-slate-100 bg-slate-50 py-16" aria-labelledby="coverage-heading">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <p className="eyebrow text-center">Coverage</p>
          <h2 id="coverage-heading" className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Every Victoria neighbourhood, ready for QR codes
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-slate-600">
            QR anchor zones are already defined for every major district. Student ambassadors can start
            distributing cards in any of these areas today.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="list">
            {QR_ZONES.map((zone) => (
              <li
                key={zone}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
              >
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                {zone}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-slate-500">
            Each zone has GPS-based coordinates — scanning any QR card automatically shows nearby accessible places.
          </p>
        </div>
      </section>

      {/* ── What government can do ── */}
      <section className="py-16" aria-labelledby="gov-heading">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <p className="eyebrow text-center">For government</p>
          <h2 id="gov-heading" className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What city and provincial support looks like
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-slate-600">
            We are not asking for funding. We are asking for four things that cost nothing.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {WHAT_GOVERNMENT_CAN_DO.map(({ title, body }, i) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alignment with legislation ── */}
      <section className="border-t border-slate-100 bg-primary-900 py-16 text-white" aria-labelledby="legislation-heading">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <Award className="mx-auto mb-4 h-10 w-10 text-primary-300" aria-hidden="true" />
          <h2 id="legislation-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Aligned with the laws already on the books
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-100">
            The <strong className="text-white">Accessible Canada Act (2019)</strong> and the{' '}
            <strong className="text-white">Accessible British Columbia Act (2021)</strong> both require
            governments to identify, remove, and prevent accessibility barriers. AccessLens provides
            the ground-level data that makes compliance visible and measurable — at no cost to the city.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Built Environment', note: 'Tracks physical access barriers at specific addresses' },
              { label: 'Information & Communication', note: 'Plain-language, mobile-first, screen-reader friendly' },
              { label: 'Employment', note: 'Student ambassadors — paid, meaningful community work' },
            ].map(({ label, note }) => (
              <div key={label} className="rounded-xl border border-primary-700 bg-primary-800 p-4 text-left">
                <p className="font-semibold text-white">{label}</p>
                <p className="mt-1 text-sm text-primary-300">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who built this ── */}
      <section className="py-16" aria-labelledby="about-heading">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <Heart className="mx-auto mb-4 h-8 w-8 text-primary-600" aria-hidden="true" />
          <h2 id="about-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built by and for the Victoria community
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            AccessLens was started by a Victoria resident who wanted one honest answer to the question:
            &ldquo;Can I actually get in the door?&rdquo; The platform is entirely community-built —
            no venture capital, no government grant, no corporate backing.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500">
            Local businesses that believe in the idea become Accessibility Partners. Their support funds
            outreach and proves the model works before we ever ask government for dollars.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-slate-200 bg-slate-50 py-16" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <Handshake className="mx-auto mb-4 h-10 w-10 text-primary-600" aria-hidden="true" />
          <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ready to explore, or ready to partner?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            The map is live. The QR cards are ready. Businesses can join today.
            We welcome conversations with City of Victoria staff, MLAs, and community organisations.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-primary-700"
            >
              <MapPin className="h-5 w-5" aria-hidden="true" />
              Explore the live map
            </Link>
            <Link
              href="/for-businesses"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Building2 className="h-5 w-5" aria-hidden="true" />
              For businesses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            To get in touch:{' '}
            <a href="mailto:hello@accesslens.ca" className="font-medium text-primary-600 hover:underline">
              hello@accesslens.ca
            </a>
          </p>
        </div>
      </section>

    </div>
  );
}
