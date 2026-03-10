'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { PLACE_CATEGORIES, CATEGORY_ICONS } from '@/models/Place';

export function PlaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [hasStepFree, setHasStepFree] = useState(searchParams.get('hasStepFree') === 'true');
  const [hasWashroom, setHasWashroom] = useState(searchParams.get('hasAccessibleWashroom') === 'true');
  const [hasParking, setHasParking] = useState(searchParams.get('hasAccessibleParking') === 'true');
  const [hasElevator, setHasElevator] = useState(searchParams.get('hasElevator') === 'true');

  const activeFilterCount = [hasStepFree, hasWashroom, hasParking, hasElevator].filter(Boolean).length +
    (category ? 1 : 0) + (search ? 1 : 0);

  function applyFilters() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (hasStepFree) params.set('hasStepFree', 'true');
    if (hasWashroom) params.set('hasAccessibleWashroom', 'true');
    if (hasParking) params.set('hasAccessibleParking', 'true');
    if (hasElevator) params.set('hasElevator', 'true');
    router.push(`/explore?${params.toString()}`);
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setHasStepFree(false);
    setHasWashroom(false);
    setHasParking(false);
    setHasElevator(false);
    router.push('/explore');
  }

  // Auto-apply on category chip click
  useEffect(() => {
    if (category !== (searchParams.get('category') || '')) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          placeholder="Search places…"
          aria-label="Search places by name"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Category chips */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500" id="category-filter-label">
          Category
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="category-filter-label">
          <button
            onClick={() => setCategory('')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              !category
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            aria-pressed={!category}
          >
            All
          </button>
          {Object.entries(PLACE_CATEGORIES).map(([slug, label]) => (
            <button
              key={slug}
              onClick={() => setCategory(category === slug ? '' : slug)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                category === slug
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-pressed={category === slug}
            >
              {CATEGORY_ICONS[slug as keyof typeof CATEGORY_ICONS]} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility features */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500" id="features-filter-label">
          Must have
        </p>
        <div className="space-y-2" role="group" aria-labelledby="features-filter-label">
          {[
            { state: hasStepFree, setter: setHasStepFree, label: 'Step-free entrance' },
            { state: hasWashroom, setter: setHasWashroom, label: 'Accessible washroom' },
            { state: hasParking, setter: setHasParking, label: 'Accessible parking' },
            { state: hasElevator, setter: setHasElevator, label: 'Elevator' },
          ].map(({ state, setter, label }) => (
            <label key={label} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={state}
                onChange={(e) => setter(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={applyFilters}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          Apply Filters
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        )}
      </div>
    </div>
  );
}
