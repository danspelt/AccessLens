'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Plus } from 'lucide-react';
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
        <h2 className="text-xl font-semibold text-slate-900">
          Is this place already listed?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
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
        >
          Search
        </Button>
      </div>

      {searched && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">
            We found {results.length} matching place{results.length !== 1 ? 's' : ''}:
          </p>
          <ul className="space-y-2" role="list">
            {results.map((place) => {
              const icon = CATEGORY_ICONS[place.category] || '📍';
              const label = PLACE_CATEGORIES[place.category] || place.category;
              return (
                <li
                  key={place._id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">{icon}</span>
                      <p className="truncate font-medium text-slate-900">{place.name}</p>
                      <Badge variant="info" className="shrink-0 text-xs">{label}</Badge>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {place.address}, {place.city}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/places/${place._id}/update-accessibility`}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                      Update Info
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-600">Not what you are looking for?</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onProceedToAdd}
              className="mt-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add a new place instead
            </Button>
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-medium text-green-800">
            No matching places found
          </p>
          <p className="mt-1 text-sm text-green-700">
            This place does not appear to be listed on AccessLens yet.
          </p>
          <Button
            type="button"
            onClick={onProceedToAdd}
            className="mt-4"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add this place
          </Button>
        </div>
      )}

      {!searched && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onProceedToAdd}
            className="text-sm text-slate-500 underline hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            Skip search and add a new place
          </button>
        </div>
      )}
    </div>
  );
}
