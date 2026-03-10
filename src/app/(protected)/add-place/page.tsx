'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ACCESSIBILITY_CHECKLIST_LABELS, PLACE_CATEGORIES, PLACE_CATEGORY_META } from '@/lib/accesslens/constants';
import { PhotoUploadField } from '@/components/ui/PhotoUploadField';

const categories = PLACE_CATEGORIES.map((category) => ({
  value: category,
  label: PLACE_CATEGORY_META[category].label,
}));

const checklistFields = Object.entries(ACCESSIBILITY_CHECKLIST_LABELS) as Array<
  [keyof typeof ACCESSIBILITY_CHECKLIST_LABELS, string]
>;

export default function AddPlacePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'libraries' as const,
    address: '',
    city: 'Victoria',
    province: 'BC',
    country: 'Canada',
    description: '',
    accessibilityNotes: '',
    latitude: '',
    longitude: '',
    photoUrls: [] as string[],
    accessibilityChecklist: {
      ramp: false,
      automaticDoor: false,
      elevator: false,
      accessibleWashroom: false,
      accessibleParking: false,
      wideAisles: false,
      smoothPath: false,
    },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? Number(formData.latitude) : undefined,
          longitude: formData.longitude ? Number(formData.longitude) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create place');
        setIsLoading(false);
        return;
      }

      // Redirect to the new place
      router.push(`/${data.place.citySlug}/${data.place.category}/${data.place.slug}`);
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add a New Place</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address *
          </label>
          <input
            type="text"
            id="address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <input
              type="text"
              id="city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700">
              Province
            </label>
            <input
              type="text"
              id="province"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="accessibilityNotes"
            className="block text-sm font-medium text-gray-700"
          >
            Accessibility notes
          </label>
          <textarea
            id="accessibilityNotes"
            rows={4}
            value={formData.accessibilityNotes}
            onChange={(e) => setFormData({ ...formData, accessibilityNotes: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Capture route details, barriers, washroom notes, or how to access the entrance."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              id="latitude"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              id="longitude"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accessibility Features
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {checklistFields.map(([field, label]) => (
              <label
                key={field}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-3"
              >
                <input
                  type="checkbox"
                  checked={formData.accessibilityChecklist[field]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accessibilityChecklist: {
                        ...formData.accessibilityChecklist,
                        [field]: e.target.checked,
                      },
                    })
                  }
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <PhotoUploadField
          label="Accessibility photos"
          description="Upload photos of entrances, ramps, washrooms, sidewalks, or barriers. These become evidence for the place profile."
          value={formData.photoUrls}
          onChange={(photoUrls) => setFormData({ ...formData, photoUrls })}
          maxFiles={8}
        />

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Place'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

