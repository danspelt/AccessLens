import Link from 'next/link';
import {
  MapPin,
  Camera,
  Star,
  Users,
  ArrowRight,
  CheckCircle,
  Building2,
  BookOpen,
  Trees,
  ShoppingBag,
  Train,
  Hospital,
} from 'lucide-react';

const stats = [
  { label: 'Places Reviewed', value: '500+', icon: MapPin },
  { label: 'Community Members', value: '1,200+', icon: Users },
  { label: 'Photos Uploaded', value: '3,400+', icon: Camera },
  { label: 'Cities Covered', value: '1', icon: Building2 },
];

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
  { icon: Building2, label: 'Restaurants', slug: 'restaurant', color: 'bg-orange-100 text-orange-700' },
  { icon: Building2, label: 'Movie Theatres', slug: 'movie_theatre', color: 'bg-purple-100 text-purple-700' },
  { icon: Trees, label: 'Parks', slug: 'park', color: 'bg-green-100 text-green-700' },
  { icon: Train, label: 'Transit', slug: 'transit', color: 'bg-sky-100 text-sky-700' },
  { icon: ShoppingBag, label: 'Shopping', slug: 'shopping', color: 'bg-pink-100 text-pink-700' },
  { icon: Hospital, label: 'Healthcare', slug: 'hospital', color: 'bg-red-100 text-red-700' },
  { icon: Building2, label: 'Government', slug: 'government', color: 'bg-slate-100 text-slate-700' },
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Now live in Victoria, BC
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Find Accessible Places
              <span className="block text-primary-300"> in Your City</span>
            </h1>
            <p className="mt-6 text-xl text-primary-100 leading-relaxed">
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

      {/* Stats */}
      <section className="border-b border-slate-100 bg-slate-50" aria-label="Platform statistics">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <Icon className="h-5 w-5 text-primary-600" aria-hidden="true" />
                </div>
                <dt className="text-3xl font-bold text-slate-900">{value}</dt>
                <dd className="mt-1 text-sm text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="categories-heading">
        <div className="text-center mb-12">
          <h2 id="categories-heading" className="text-3xl font-bold text-slate-900">
            Browse by Category
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Find accessibility information for any type of place in Victoria
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map(({ icon: Icon, label, slug, color }) => (
            <Link
              key={slug}
              href={`/explore?category=${slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-primary-700">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl font-bold text-slate-900">
              Everything you need to navigate accessibly
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Real information from real people who use these spaces every day
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="rounded-xl bg-white p-6 shadow-card">
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

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="how-it-works-heading">
        <div className="text-center mb-12">
          <h2 id="how-it-works-heading" className="text-3xl font-bold text-slate-900">
            How it works
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {howItWorks.map(({ step, title, description }) => (
            <div key={step} className="relative text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-xl font-bold text-white shadow-lg">
                {step}
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-slate-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Accessibility Checklist Preview */}
      <section className="bg-primary-900 py-20 text-white" aria-labelledby="checklist-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 id="checklist-heading" className="text-3xl font-bold">
                Detailed accessibility checklist for every place
              </h2>
              <p className="mt-4 text-lg text-primary-200 leading-relaxed">
                Our comprehensive checklist covers everything that matters — from entrance ramps
                and automatic doors to accessible washrooms, elevators, and service animal policies.
              </p>
              <Link
                href="/explore"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary-900 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Start Exploring
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-2xl bg-primary-800 p-6">
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
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="cta-heading" className="text-3xl font-bold text-slate-900">
            Help build the accessibility map of Victoria
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every review, photo, and report you contribute helps people with disabilities
            navigate our city with confidence. Join over 1,200 community members making
            Victoria more accessible.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              Browse without signing up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">AccessLens</h3>
              <p className="mt-2 text-sm text-slate-600">
                Accessibility intelligence for cities. Starting in Victoria, BC.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Aligned with the Accessible Canada Act and BC Accessibility Act.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Platform</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600" role="list">
                <li><Link href="/explore" className="hover:text-primary-600">Explore Places</Link></li>
                <li><Link href="/add-place" className="hover:text-primary-600">Add a Place</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary-600">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Community</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600" role="list">
                <li><Link href="/signup" className="hover:text-primary-600">Join AccessLens</Link></li>
                <li><Link href="/login" className="hover:text-primary-600">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} AccessLens. Built with care for the accessibility community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
