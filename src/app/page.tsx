import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { getCollection } from '@/lib/db/mongoClient';
import { getActiveCities } from '@/lib/db/cities';
import { getSiteContentBatch } from '@/lib/db/siteContent';
import { resolveIcon } from '@/lib/icons';
import {
  CATEGORY_ICONS,
  PLACE_CATEGORIES,
  type Place,
  type PlaceCategory,
} from '@/models/Place';

// --- Fallbacks used only when a site_content key is not yet seeded ---------
import type {
  HomeChecklistItem,
  HomeCtaContent,
  HomeFeatureItem,
  HomeHeroContent,
  HomeStepItem,
  HomeTestimonialContent,
  HomeTrustStripItem,
  HomeValueItem,
} from '@/models/SiteContent';

const FALLBACK_HERO: HomeHeroContent = {
  eyebrow: 'Community-driven accessibility map',
  titleLine1: 'Find Accessible Places',
  titleLine2: 'in Your City',
  description:
    'AccessLens is the community-driven accessibility map for public places. Search, review, and report accessibility information so everyone can navigate their city with confidence.',
  primaryCtaLabel: 'Explore the map',
  primaryCtaHref: '/explore',
  secondaryCtaLabel: 'Join the Community',
  secondaryCtaHref: '/signup',
};

const FALLBACK_CTA: HomeCtaContent = {
  title: "Help build your city's accessibility map",
  description:
    'Every review, photo, and checklist update helps someone plan their day with less uncertainty. Sign up to contribute, or explore the map anonymously anytime.',
  primaryCtaLabel: 'Create free account',
  primaryCtaHref: '/signup',
  secondaryCtaLabel: 'Browse without signing up',
  secondaryCtaHref: '/explore',
};

// --- Server data fetch -----------------------------------------------------

async function getHomeData() {
  const placesCollection = await getCollection<Place>('places');

  const [content, cities, totalPlaces, categoryAgg, featuredPlaces] = await Promise.all([
    getSiteContentBatch([
      'home.hero',
      'home.trustStrip',
      'home.features',
      'home.values',
      'home.howItWorks',
      'home.sampleChecklist',
      'home.cta',
      'home.testimonial',
    ] as const),
    getActiveCities(),
    placesCollection.countDocuments({}),
    placesCollection
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray(),
    placesCollection
      .find({ accessibilityScore: { $exists: true } })
      .sort({ accessibilityScore: -1, createdAt: -1 })
      .limit(6)
      .toArray(),
  ]);

  const avgScoreAgg = await placesCollection
    .aggregate<{ _id: null; avg: number | null }>([
      { $match: { accessibilityScore: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$accessibilityScore' } } },
    ])
    .toArray();
  const avgScore = avgScoreAgg[0]?.avg ?? null;

  return {
    hero: content['home.hero'] ?? FALLBACK_HERO,
    trustStrip: content['home.trustStrip'] ?? [],
    features: content['home.features'] ?? [],
    values: content['home.values'] ?? [],
    howItWorks: content['home.howItWorks'] ?? [],
    sampleChecklist: content['home.sampleChecklist'] ?? [],
    cta: content['home.cta'] ?? FALLBACK_CTA,
    testimonial: content['home.testimonial'] ?? null,
    cities,
    stats: {
      totalPlaces,
      totalCities: cities.length,
      totalCategories: categoryAgg.length,
      avgScore: avgScore === null ? null : Math.round(avgScore),
    },
    categoryCounts: categoryAgg,
    featuredPlaces: featuredPlaces.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      address: p.address,
      city: p.city,
      province: p.province,
      category: p.category,
      accessibilityScore: p.accessibilityScore,
    })),
  };
}

// --- UI sub-components -----------------------------------------------------

function TrustStrip({ items }: { items: HomeTrustStripItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ul
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-slate-600"
          role="list"
        >
          {items.map(({ label, icon }) => {
            const Icon = resolveIcon(icon);
            return (
              <li key={label} className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                </span>
                <span className="font-medium text-slate-700">{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function FeaturesSection({ items }: { items: HomeFeatureItem[] }) {
  if (items.length === 0) return null;
  return (
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
          {items.map((feature) => {
            const Icon = resolveIcon(feature.icon);
            return (
              <div
                key={feature.title}
                className="rounded-2xl panel-surface p-6 transition-all duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-primary-200/80 motion-safe:hover:shadow-card-hover"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.colorClass}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ValuesSection({ items }: { items: HomeValueItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="values-heading">
      <div className="text-center mb-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Why AccessLens</p>
        <h2 id="values-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          A map that respects how people move through the world
        </h2>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        {items.map((value) => {
          const Icon = resolveIcon(value.icon);
          return (
            <div
              key={value.title}
              className="relative overflow-hidden rounded-2xl panel-surface p-8"
            >
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${value.colorClass}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{value.title}</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{value.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorksSection({ steps }: { steps: HomeStepItem[] }) {
  if (steps.length === 0) return null;
  return (
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
          {steps.map(({ step, title, description }) => (
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
  );
}

function ChecklistSection({ items }: { items: HomeChecklistItem[] }) {
  if (items.length === 0) return null;
  const CheckCircle = resolveIcon('CheckCircle');
  return (
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
              {items.map(({ label, checked }) => (
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
  );
}

// --- Page ------------------------------------------------------------------

export default async function HomePage() {
  const data = await getHomeData();
  const { hero, trustStrip, features, values, howItWorks, sampleChecklist, cta, testimonial, cities, stats, categoryCounts, featuredPlaces } = data;

  const liveCityLabel =
    cities.length === 1
      ? `Now live in ${cities[0].name}, ${cities[0].province}`
      : cities.length > 1
        ? `Live in ${cities.length} cities`
        : hero.eyebrow;

  // Category list built from real data (distinct categories in DB)
  const categories = categoryCounts
    .map(({ _id, count }) => {
      const slug = _id as PlaceCategory;
      const label = PLACE_CATEGORIES[slug] || slug;
      const icon = CATEGORY_ICONS[slug] || '📍';
      return { slug, label, count, icon };
    })
    .slice(0, 8);

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
              {liveCityLabel}
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-7xl">
              {hero.titleLine1}
              <span className="block text-primary-200"> {hero.titleLine2}</span>
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-white/95 [text-shadow:0_1px_16px_rgba(0,0,0,0.35)]">
              {hero.description}
            </p>

            {stats.totalPlaces > 0 && (
              <dl className="mt-8 grid grid-cols-3 gap-4 rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm ring-1 ring-white/15">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-primary-200">Places</dt>
                  <dd className="mt-1 text-2xl font-bold">{stats.totalPlaces}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-primary-200">Categories</dt>
                  <dd className="mt-1 text-2xl font-bold">{stats.totalCategories}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-primary-200">Avg score</dt>
                  <dd className="mt-1 text-2xl font-bold">
                    {stats.avgScore !== null ? `${stats.avgScore}/100` : '—'}
                  </dd>
                </div>
              </dl>
            )}

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={hero.primaryCtaHref}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-900 shadow-lg hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
              >
                {hero.primaryCtaLabel}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href={hero.secondaryCtaHref}
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
              >
                {hero.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip items={trustStrip} />

      {/* Cities */}
      {cities.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="cities-heading">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Cities</p>
            <h2 id="cities-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Where AccessLens is live
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/cities/${c.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl panel-surface p-5 hover:shadow-card-hover transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 group-hover:text-primary-700 truncate">
                    {c.name}, {c.province}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-primary-600 shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Browse by Category (real categories from DB) */}
      {categories.length > 0 && (
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
            {categories.map(({ slug, label, icon, count }) => (
              <Link
                key={slug}
                href={`/explore?category=${slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white/95 to-slate-50/85 p-6 shadow-card ring-1 ring-slate-900/[0.04] backdrop-blur-md transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:border-primary-200 motion-safe:hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-3xl">
                  <span aria-hidden="true">{icon}</span>
                </div>
                <span className="text-center text-sm font-semibold text-slate-800 group-hover:text-primary-700">
                  {label}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {count} place{count !== 1 ? 's' : ''}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured places (real data) */}
      {featuredPlaces.length > 0 && (
        <section className="border-y border-slate-100 bg-slate-50 py-16" aria-labelledby="featured-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Top-rated</p>
                <h2 id="featured-heading" className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Highest accessibility scores
                </h2>
              </div>
              <Link
                href="/explore"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                View all
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPlaces.map((p) => {
                const icon = CATEGORY_ICONS[p.category as PlaceCategory] || '📍';
                const label = PLACE_CATEGORIES[p.category as PlaceCategory] || p.category;
                return (
                  <Link
                    key={p.id}
                    href={`/places/${p.id}`}
                    className="group flex gap-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-900/[0.04] hover:shadow-card-hover transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-2xl">
                      <span aria-hidden="true">{icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 group-hover:text-primary-700 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {label} · {p.city}, {p.province}
                      </p>
                      {typeof p.accessibilityScore === 'number' && (
                        <p className="mt-1 text-xs font-medium text-slate-600">
                          Score: {p.accessibilityScore}/100
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <FeaturesSection items={features} />
      <ValuesSection items={values} />
      <HowItWorksSection steps={howItWorks} />
      <ChecklistSection items={sampleChecklist} />

      {/* CTA */}
      <section className="py-20" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-primary-50/40 to-sky-50/50 p-10 text-center shadow-xl sm:p-14">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-200/30 blur-2xl"
              aria-hidden="true"
            />
            <h2 id="cta-heading" className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {cta.title}
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              {cta.description}
            </p>
            {testimonial && (
              <blockquote className="mt-8 border-l-4 border-primary-400 pl-4 text-left text-slate-700 italic sm:pl-5">
                <p className="text-base leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <footer className="mt-2 text-sm font-medium not-italic text-slate-500">
                  — {testimonial.attribution}
                </footer>
              </blockquote>
            )}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={cta.primaryCtaHref}
                className="link-cta-primary gap-2 px-8 py-4 text-base"
              >
                {cta.primaryCtaLabel}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href={cta.secondaryCtaHref}
                className="link-cta-outline gap-2 px-8 py-4 text-base"
              >
                {cta.secondaryCtaLabel}
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
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 text-white shadow-btn-primary ring-1 ring-white/20">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">AccessLens</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Community-sourced accessibility information for public places.
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
                  <Link href="/signin" className="transition-colors hover:text-primary-600">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Cities</h3>
              {cities.length > 0 ? (
                <ul className="mt-4 space-y-2.5 text-sm text-slate-600" role="list">
                  {cities.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/cities/${c.slug}`}
                        className="transition-colors hover:text-primary-600"
                      >
                        {c.name}, {c.province}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500">More cities coming soon.</p>
              )}
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
