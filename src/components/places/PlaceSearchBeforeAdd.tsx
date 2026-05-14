'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Plus, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PLACE_CATEGORIES, CATEGORY_ICONS, type PlaceCategory } from '@/models/Place';

interface SearchResult {
  _id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  city: string;
  province: string;
  accessibilityScore?: number;
}

interface Props {
  onProceedToAdd: () => void;
}

export function PlaceSearchBeforeAdd({ onProceedToAdd }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await fetch(`/api/places/search?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.places || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-primary-50 to-primary-100 ring-1 ring-primary-200/60">
          <Search className="h-6 w-6 text-primary-600" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Is this place already listed?
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Search AccessLens first to avoid duplicate listings. If the place is already here, you can update its accessibility info instead.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Blue Fox Cafe, Victoria Public Library, Save-On-Foods"
            className="pl-10"
            aria-label="Search for a business or place"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={query.trim().length < 2 || loading}
          loading={loading}
          className="bg-gradient-to-b from-primary-500 to-primary-700 shadow-btn-primary ring-1 ring-white/15 hover:from-primary-500 hover:to-primary-600"
        >
          Search
        </Button>
      </div>

      {searched && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            We found {results.length} matching place{results.length !== 1 ? 's' : ''}:
          </p>
          <ul className="space-y-2" role="list">
            {results.map((place) => {
              const icon = CATEGORY_ICONS[place.category] || '📍';
              const label = PLACE_CATEGORIES[place.category] || place.category;
              return (
                <li
                  key={place._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:border-slate-300"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">{icon}</span>
                      <p className="truncate font-semibold text-slate-900">{place.name}</p>
                      <Badge variant="info" className="shrink-0 text-xs">{label}</Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {place.address}, {place.city}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/places/${place._id}/update-accessibility`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-gradient-to-b from-primary-50 to-primary-100/80 px-3.5 py-2 text-xs font-semibold text-primary-700 shadow-sm ring-1 ring-primary-100/50 transition-all hover:from-primary-100 hover:to-primary-150 hover:shadow-md"
                    >
                      Update Info
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5 text-center">
            <p className="text-sm text-slate-600">Not what you are looking for?</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onProceedToAdd}
              className="mt-3 shadow-btn-outline"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add a new place instead
            </Button>
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="rounded-2xl border border-green-200 bg-gradient-to-b from-green-50 to-green-100/50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-200/70">
            <CheckCircle2 className="h-6 w-6 text-green-700" aria-hidden="true" />
          </div>
          <p className="font-bold text-green-800 text-lg">
            No matching places found
          </p>
          <p className="mt-1.5 text-sm text-green-700">
            This place does not appear to be listed on AccessLens yet.
          </p>
          <Button
            type="button"
            onClick={onProceedToAdd}
            className="mt-5 bg-gradient-to-b from-primary-500 to-primary-700 shadow-btn-primary ring-1 ring-white/15 hover:from-primary-500 hover:to-primary-600"
          >
            <Plus className="h-4 w-4 drop-shadow-sm" aria-hidden="true" />
            Add this place
          </Button>
        </div>
      )}

      {!searched && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onProceedToAdd}
            className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            Skip search and add a new place
          </button>
        </div>
      )}
    </div>
  );
}
