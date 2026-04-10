'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { CATEGORY_ICONS, getScoreColor } from '@/models/Place';
import {
  LayoutDashboard,
  Plus,
  MapPin,
  Star,
  ChevronRight,
  Search,
  ArrowUpDown,
  Clock,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

export type DashboardStats = {
  placesCount: number;
  reviewsCount: number;
  avgRating: number | null;
  latestContributionAt: string | null;
};

export type DashboardActivityItem = {
  type: 'place' | 'review';
  id: string;
  title: string;
  subtitle: string;
  href: string;
  createdAt: string;
};

export type DashboardPlaceItem = {
  id: string;
  name: string;
  address: string;
  category: keyof typeof CATEGORY_ICONS | string;
  categoryLabel: string;
  accessibilityScore?: number;
  createdAt: string;
};

export type DashboardReviewItem = {
  id: string;
  placeId: string;
  placeName: string;
  placeCategory: keyof typeof CATEGORY_ICONS | string;
  rating: number;
  comment: string;
  createdAt: string;
};

type PlacesSort = 'newest' | 'oldest' | 'best_score';
type ReviewsSort = 'newest' | 'oldest' | 'highest_rating';

function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card padding="sm" className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
          {icon}
        </div>
      </div>
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-primary-100 to-transparent blur-2xl" />
    </Card>
  );
}

function ActivityIcon({ type }: { type: DashboardActivityItem['type'] }) {
  return (
    <div
      className={clsx(
        'flex h-10 w-10 items-center justify-center rounded-xl',
        type === 'place' ? 'bg-primary-50 text-primary-700' : 'bg-amber-50 text-amber-800'
      )}
      aria-hidden="true"
    >
      {type === 'place' ? <MapPin className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
    </div>
  );
}

export default function DashboardClient({
  userName,
  stats,
  activity,
  places,
  reviews,
}: {
  userName: string;
  stats: DashboardStats;
  activity: DashboardActivityItem[];
  places: DashboardPlaceItem[];
  reviews: DashboardReviewItem[];
}) {
  const firstName = userName.split(' ')[0] || userName;

  const [placeQuery, setPlaceQuery] = useState('');
  const [reviewQuery, setReviewQuery] = useState('');
  const [placesSort, setPlacesSort] = useState<PlacesSort>('newest');
  const [reviewsSort, setReviewsSort] = useState<ReviewsSort>('newest');

  const filteredPlaces = useMemo(() => {
    const q = placeQuery.trim().toLowerCase();
    let list = q
      ? places.filter((p) => `${p.name} ${p.address} ${p.categoryLabel}`.toLowerCase().includes(q))
      : places.slice();

    list.sort((a, b) => {
      if (placesSort === 'best_score') {
        return (b.accessibilityScore ?? -1) - (a.accessibilityScore ?? -1);
      }
      if (placesSort === 'oldest') return a.createdAt < b.createdAt ? -1 : 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
    return list;
  }, [placeQuery, places, placesSort]);

  const filteredReviews = useMemo(() => {
    const q = reviewQuery.trim().toLowerCase();
    let list = q
      ? reviews.filter((r) => `${r.placeName} ${r.comment}`.toLowerCase().includes(q))
      : reviews.slice();

    list.sort((a, b) => {
      if (reviewsSort === 'highest_rating') return b.rating - a.rating;
      if (reviewsSort === 'oldest') return a.createdAt < b.createdAt ? -1 : 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
    return list;
  }, [reviewQuery, reviews, reviewsSort]);

  const avgRatingLabel = stats.avgRating === null ? '—' : stats.avgRating.toFixed(1);
  const latestLabel =
    stats.latestContributionAt === null
      ? 'No activity yet'
      : formatDistanceToNow(new Date(stats.latestContributionAt), { addSuffix: true });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="w-full px-3 py-8 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-primary-500 to-primary-700 text-white shadow-btn-primary ring-1 ring-white/20">
                <LayoutDashboard className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-slate-900">Welcome back, {firstName}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Track your contributions and keep improving real-world accessibility.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="info">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                    {stats.placesCount} place{stats.placesCount !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="warning">
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    {stats.reviewsCount} review{stats.reviewsCount !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="default">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Latest: {latestLabel}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link href="/add-place" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add Place
                </Button>
              </Link>
              <Link href="/explore" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Places added"
              value={`${stats.placesCount}`}
              hint="Your mapped locations"
              icon={<MapPin className="h-5 w-5" />}
            />
            <StatCard
              label="Reviews submitted"
              value={`${stats.reviewsCount}`}
              hint="Your accessibility notes"
              icon={<MessageSquare className="h-5 w-5" />}
            />
            <StatCard
              label="Avg rating"
              value={avgRatingLabel}
              hint={stats.avgRating === null ? 'Add reviews to see this' : 'Across your reviews'}
              icon={<Star className="h-5 w-5" />}
            />
            <StatCard
              label="Latest contribution"
              value={stats.latestContributionAt ? 'Active' : 'Start'}
              hint={latestLabel}
              icon={<Clock className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>

      <div className="w-full px-3 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Activity */}
          <section className="lg:col-span-1" aria-labelledby="activity-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="activity-heading" className="text-lg font-semibold text-slate-900">
                Recent activity
              </h2>
              <span className="text-xs text-slate-500">Last {activity.length}</span>
            </div>

            <Card padding="md">
              {activity.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">No activity yet</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Add a place or leave a review to start building your impact.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:flex-row">
                    <Link href="/add-place" className="flex-1">
                      <Button className="w-full">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add place
                      </Button>
                    </Link>
                    <Link href="/explore" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Explore
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <ol className="space-y-3" aria-label="Recent dashboard activity">
                  {activity.map((item) => (
                    <li key={`${item.type}:${item.id}`}>
                      <Link
                        href={item.href}
                        className="group flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      >
                        <ActivityIcon type={item.type} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 truncate">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{item.subtitle}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary-600" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </section>

          {/* Places + Reviews */}
          <div className="lg:col-span-2 grid gap-8">
            {/* Places */}
            <section aria-labelledby="my-places-heading">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id="my-places-heading" className="text-lg font-semibold text-slate-900">
                    Your places
                  </h2>
                  <p className="text-sm text-slate-600">Search, sort, and jump back into editing or reviewing.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      value={placeQuery}
                      onChange={(e) => setPlaceQuery(e.target.value)}
                      placeholder="Search places…"
                      className="pl-9"
                      aria-label="Search your places"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <Select
                      value={placesSort}
                      onChange={(e) => setPlacesSort(e.target.value as PlacesSort)}
                      aria-label="Sort your places"
                      className="w-full sm:w-44"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="best_score">Best score</option>
                    </Select>
                  </div>
                </div>
              </div>

              <Card padding="md">
                {filteredPlaces.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {places.length === 0 ? 'Add your first place' : 'No matches'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {places.length === 0
                          ? 'Start by adding a location you know well. Every contribution helps.'
                          : 'Try a different search term or change the sort.'}
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:flex-row">
                      <Link href="/add-place" className="flex-1">
                        <Button className="w-full">
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          Add place
                        </Button>
                      </Link>
                      <Link href="/explore" className="flex-1">
                        <Button variant="outline" className="w-full">
                          Explore
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <ol className="space-y-2" aria-label="Places you have contributed">
                    {filteredPlaces.map((p) => {
                      const score = p.accessibilityScore;
                      const scoreColor = score === undefined ? null : getScoreColor(score);
                      const scoreText =
                        scoreColor === 'green'
                          ? 'text-green-700 bg-green-50 border-green-200'
                          : scoreColor === 'yellow'
                            ? 'text-yellow-800 bg-yellow-50 border-yellow-200'
                            : scoreColor === 'red'
                              ? 'text-red-700 bg-red-50 border-red-200'
                              : 'text-slate-700 bg-slate-50 border-slate-200';

                      const icon = CATEGORY_ICONS[p.category as keyof typeof CATEGORY_ICONS] || '📍';

                      return (
                        <li key={p.id}>
                          <Link
                            href={`/places/${p.id}`}
                            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                              {icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 truncate">
                                {p.name}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500 truncate">
                                {p.categoryLabel} · {p.address}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Added {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {score !== undefined && (
                              <span className={clsx('shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold', scoreText)}>
                                {score}
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary-600" aria-hidden="true" />
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Card>
            </section>

            {/* Reviews */}
            <section aria-labelledby="my-reviews-heading">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id="my-reviews-heading" className="text-lg font-semibold text-slate-900">
                    Your reviews
                  </h2>
                  <p className="text-sm text-slate-600">Your notes help others plan with confidence.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      value={reviewQuery}
                      onChange={(e) => setReviewQuery(e.target.value)}
                      placeholder="Search reviews…"
                      className="pl-9"
                      aria-label="Search your reviews"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <Select
                      value={reviewsSort}
                      onChange={(e) => setReviewsSort(e.target.value as ReviewsSort)}
                      aria-label="Sort your reviews"
                      className="w-full sm:w-44"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="highest_rating">Highest rating</option>
                    </Select>
                  </div>
                </div>
              </div>

              <Card padding="md">
                {filteredReviews.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <Star className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {reviews.length === 0 ? 'Write your first review' : 'No matches'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {reviews.length === 0
                          ? 'Explore places and share what worked well (or didn’t).'
                          : 'Try a different search term or change the sort.'}
                      </p>
                    </div>
                    <Link href="/explore" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Explore places
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ol className="space-y-2" aria-label="Your submitted reviews">
                    {filteredReviews.map((r) => {
                      const icon = CATEGORY_ICONS[r.placeCategory as keyof typeof CATEGORY_ICONS] || '📍';
                      return (
                        <li key={r.id}>
                          <Link
                            href={`/places/${r.placeId}`}
                            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                              {icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 truncate">
                                {r.placeName}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{r.comment}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                              {r.rating}
                            </span>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary-600" aria-hidden="true" />
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

