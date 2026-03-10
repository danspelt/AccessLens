'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PLACE_CATEGORIES, PLACE_CATEGORY_META } from '@/lib/accesslens/constants';

const categories = [
  { value: 'all', label: 'All categories' },
  ...PLACE_CATEGORIES.map((category) => ({
    value: category,
    label: PLACE_CATEGORY_META[category].label,
  })),
];

export function PlaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [ramp, setRamp] = useState(searchParams.get('ramp') === 'true');
  const [automaticDoor, setAutomaticDoor] = useState(searchParams.get('automaticDoor') === 'true');
  const [accessibleWashroom, setAccessibleWashroom] = useState(
    searchParams.get('accessibleWashroom') === 'true'
  );
  const [accessibleParking, setAccessibleParking] = useState(
    searchParams.get('accessibleParking') === 'true'
  );

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category !== 'all') params.set('category', category);
    if (ramp) params.set('ramp', 'true');
    if (automaticDoor) params.set('automaticDoor', 'true');
    if (accessibleWashroom) params.set('accessibleWashroom', 'true');
    if (accessibleParking) params.set('accessibleParking', 'true');
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by place name or address"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
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
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Accessibility checklist
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={ramp}
                onChange={(event) => setRamp(event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ramp or step-free entrance</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={automaticDoor}
                onChange={(event) => setAutomaticDoor(event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Automatic door</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={accessibleWashroom}
                onChange={(event) => setAccessibleWashroom(event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Accessible washroom</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={accessibleParking}
                onChange={(event) => setAccessibleParking(event.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Accessible parking</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={updateFilters}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('all');
              setRamp(false);
              setAutomaticDoor(false);
              setAccessibleWashroom(false);
              setAccessibleParking(false);
              router.push('/explore');
            }}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

