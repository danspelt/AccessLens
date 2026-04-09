import Link from 'next/link';
import {
  MapPin,
  Camera,
  Star,
  Users,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Trees,
  ShoppingBag,
  Train,
  Hospital,
  UtensilsCrossed,
  Film,
  Landmark,
  Heart,
  Sparkles,
  ShieldCheck,
  Compass,
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Real Accessibility Data',
    description:
      'Community-verified accessibility information for every place — entrances, washrooms, parking, elevators, and more.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Camera,
    title: 'Photo Evidence',
    description:
      'Photos of ramps, doors, washrooms, and pathways uploaded by real people who visit these places.',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Star,
    title: 'Accessibility Score',
    description:
      'Each place gets an accessibility score from 0–100 based on community reviews and checklist data.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Users,
    title: 'Community Reports',
    description:
      'Real-time reports of broken elevators, blocked ramps, and construction barriers so you always have current info.',
    color: 'text-purple-600 bg-purple-50',
  },
];

const categories = [
  { icon: BookOpen, label: 'Libraries', slug: 'library', color: 'bg-blue-100 text-blue-700' },
  { icon: UtensilsCrossed, label: 'Restaurants', slug: 'restaurant', color: 'bg-orange-100 text-orange-700' },
  { icon: Film, label: 'Movie Theatres', slug: 'movie_theatre', color: 'bg-purple-100 text-purple-700' },
  { icon: Trees, label: 'Parks', slug: 'park', color: 'bg-green-100 text-green-700' },
  { icon: Train, label: 'Transit', slug: 'transit', color: 'bg-sky-100 text-sky-700' },
  { icon: ShoppingBag, label: 'Shopping', slug: 'shopping', color: 'bg-pink-100 text-pink-700' },
  { icon: Hospital, label: 'Healthcare', slug: 'hospital', color: 'bg-red-100 text-red-700' },
  { icon: Landmark, label: 'Government', slug: 'government', color: 'bg-slate-100 text-slate-700' },
];

const trustStrip = [
  { icon: Users, label: 'Community-led reviews' },
  { icon: Camera, label: 'Photo evidence' },
  { icon: ShieldCheck, label: 'Transparent checklists' },
  { icon: Sparkles, label: 'Free to use' },
];

const values = [
  {
    icon: Heart,
    title: 'Grounded in lived experience',
    description:
      'Accessibility is not a checkbox — it is how real people move through doors, aisles, transit, and services every day.',
    color: 'text-rose-600 bg-rose-50',
  },
  {
    icon: Compass,
    title: 'Plan with confidence',
    description:
      'See entrances, washrooms, parking, and elevators before you go, so fewer surprises when you arrive.',
    color: 'text-primary-600 bg-primary-50',
  },
  {
    icon: Users,
    title: 'Stronger when we share',
    description:
      'Every photo and honest review helps the next visitor. Your knowledge makes the map more useful for everyone.',
    color: 'text-violet-600 bg-violet-50',
  },
];

const howItWorks = [
  {
    step: '1',
    title: 'Search a place',
    description: 'Find any public place in Victoria BC — restaurants, parks, theatres, libraries.',
  },
  {
    step: '2',
    title: 'View accessibility details',
    description: 'See the accessibility checklist, score, photos, and community reviews.',
  },
  {
    step: '3',
    title: 'Contribute your experience',
    description: 'Upload photos, complete the accessibility checklist, and share your honest review.',
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-[url('/hero-map-bg.png')] bg-cover bg-center bg-no-repeat"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-900/96 via-primary-900/94 to-primary-800/95"
          aria-hidden="true"
        />
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/15 bg-primary-900/60 px-6 py-10 text-center shadow-2xl shadow-black/30 backdrop-blur-md sm:px-10 sm:py-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm ring-1 ring-white/20">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Now live in Victoria, BC
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-7xl">
              Find Accessible Places
              <span className="block text-primary-200"> in Your City</span>
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-white/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.35)]">
              AccessLens is the community-driven accessibility map for public places.
              Search, review, and report accessibility information so everyone can navigate
              their city with confidence.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-900 shadow-lg hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
              >
                Explore Victoria
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
              >
                Join the Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ul
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-slate-600"
            role="list"
          >
            {trustStrip.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                </span>
                <span className="font-medium text-slate-700">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Browse by Category */}
      <section
        className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="categories-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-3xl rounded-full bg-primary-100/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Explore</p>
          <h2 id="categories-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Browse by category
          </h2>
          <p className="mt-3 mx-auto max-w-2xl text-lg text-slate-600">
            Jump straight into the kinds of places you need — each link opens the map with filters applied.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map(({ icon: Icon, label, slug, color }) => (
            <Link
              key={slug}
              href={`/explore?category=${slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:border-primary-200 motion-safe:hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 motion-safe:group-hover:scale-105 ${color}`}
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <span className="text-center text-sm font-semibold text-slate-800 group-hover:text-primary-700">
                {label}
              </span>
              <span className="text-xs font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
                View on map →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-100 bg-gradient-to-b from-slate-50 to-white py-20" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">The map</p>
            <h2 id="features-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to navigate accessibly
            </h2>
            <p className="mt-3 mx-auto max-w-2xl text-lg text-slate-600">
              Real information from people who use these spaces — not generic listings.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition-all duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-primary-100 motion-safe:hover:shadow-md"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="values-heading">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Why AccessLens</p>
          <h2 id="values-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A map that respects how people move through the world
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {values.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        className="bg-slate-50 py-20 border-t border-slate-100"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Get started</p>
            <h2 id="how-it-works-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 mx-auto max-w-2xl text-lg text-slate-600">
              Three steps from searching a place to helping the next person who visits.
            </p>
          </div>
          <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div
              className="pointer-events-none absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-transparent via-primary-200 to-transparent sm:block"
              aria-hidden="true"
            />
            {howItWorks.map(({ step, title, description }) => (
              <div key={step} className="relative text-center">
                <div className="relative z-10 mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white shadow-lg ring-4 ring-slate-50">
                  {step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Checklist Preview */}
      <section className="relative overflow-hidden bg-primary-900 py-20 text-white" aria-labelledby="checklist-heading">
        <div
          className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-300">Depth, not guesswork</p>
              <h2 id="checklist-heading" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Detailed accessibility checklist for every place
              </h2>
              <p className="mt-4 text-lg text-primary-100 leading-relaxed">
                Our comprehensive checklist covers what actually matters — entrance ramps and automatic doors,
                accessible washrooms, elevators, service animal policies, and more.
              </p>
              <Link
                href="/explore"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary-900 shadow-lg transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
              >
                Start exploring
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-2xl border border-primary-700/80 bg-primary-800/90 p-6 shadow-2xl backdrop-blur-sm">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary-300">
                Sample Accessibility Checklist
              </p>
              <ul className="space-y-3" role="list">
                {[
                  { label: 'Entrance ramp or level access', checked: true },
                  { label: 'Automatic door opener', checked: true },
                  { label: 'Elevator to all floors', checked: true },
                  { label: 'Accessible washroom', checked: false },
                  { label: 'Accessible parking', checked: true },
                  { label: 'Wide aisles (36"+)', checked: false },
                  { label: 'Braille signage', checked: false },
                  { label: 'Service animals welcome', checked: true },
                ].map(({ label, checked }) => (
                  <li key={label} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        checked ? 'bg-green-500' : 'bg-red-500/70'
                      }`}
                      aria-hidden="true"
                    >
                      {checked ? (
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <span className="block h-1 w-3 rounded bg-white" />
                      )}
                    </span>
                    <span className="text-sm text-primary-100">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-primary-50/40 to-sky-50/50 p-10 text-center shadow-xl sm:p-14">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-200/30 blur-2xl"
              aria-hidden="true"
            />
            <Sparkles className="mx-auto h-10 w-10 text-primary-500" aria-hidden="true" />
            <h2 id="cta-heading" className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Help build Victoria&apos;s accessibility map
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Every review, photo, and checklist update helps someone plan their day with less uncertainty.
              Sign up to contribute, or explore the map anonymously anytime.
            </p>
            <blockquote className="mt-8 border-l-4 border-primary-400 pl-4 text-left text-slate-700 italic sm:pl-5">
              <p className="text-base leading-relaxed">
                &ldquo;When the details are shared openly, we all move through the city with more dignity and
                fewer surprises.&rdquo;
              </p>
              <footer className="mt-2 text-sm font-medium not-italic text-slate-500">
                — The AccessLens community
              </footer>
            </blockquote>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Create free account
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              >
                Browse without signing up
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">AccessLens</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Community-sourced accessibility information for public places — starting in Victoria, BC.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Inspired by goals aligned with the Accessible Canada Act and BC Accessibility Act.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Platform</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600" role="list">
                <li>
                  <Link href="/explore" className="transition-colors hover:text-primary-600">
                    Explore places
                  </Link>
                </li>
                <li>
                  <Link href="/qr" className="transition-colors hover:text-primary-600">
                    Location codes (QR)
                  </Link>
                </li>
                <li>
                  <Link href="/add-place" className="transition-colors hover:text-primary-600">
                    Add a place
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="transition-colors hover:text-primary-600">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Account</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600" role="list">
                <li>
                  <Link href="/signup" className="transition-colors hover:text-primary-600">
                    Join AccessLens
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition-colors hover:text-primary-600">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">On the map</h3>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Search by category, read checklists and photos, then leave your own experience for the next
                visitor.
              </p>
              <Link
                href="/explore"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Open explore
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} AccessLens. Built with care for the accessibility community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
