'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'arena', label: 'Arena' },
  { value: 'pool', label: 'Pool' },
  { value: 'rink', label: 'Rink' },
  { value: 'park', label: 'Park' },
  { value: 'sidewalk', label: 'Sidewalk' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
];

export function PlaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [hasStepFree, setHasStepFree] = useState(searchParams.get('hasStepFree') === 'true');
  const [hasAccessibleWashroom, setHasAccessibleWashroom] = useState(
    searchParams.get('hasAccessibleWashroom') === 'true'
  );
  const [hasAccessibleParking, setHasAccessibleParking] = useState(
    searchParams.get('hasAccessibleParking') === 'true'
  );

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (hasStepFree) params.set('hasStepFree', 'true');
    if (hasAccessibleWashroom) params.set('hasAccessibleWashroom', 'true');
    if (hasAccessibleParking) params.set('hasAccessibleParking', 'true');
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accessibility Features
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={hasStepFree}
                onChange={(e) => setHasStepFree(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Step-free access</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={hasAccessibleWashroom}
                onChange={(e) => setHasAccessibleWashroom(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Accessible washroom</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={hasAccessibleParking}
                onChange={(e) => setHasAccessibleParking(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Accessible parking</span>
            </label>
          </div>
        </div>

        <button
          onClick={updateFilters}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

