'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoUploadField } from '@/components/ui/PhotoUploadField';

interface UploadEvidenceFormProps {
  placeOptions: Array<{
    id: string;
    label: string;
  }>;
}

export function UploadEvidenceForm({ placeOptions }: UploadEvidenceFormProps) {
  const router = useRouter();
  const [placeId, setPlaceId] = useState(placeOptions[0]?.id ?? '');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const response = await fetch(`/api/places/${placeId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoUrls }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save evidence photos.');
      }

      setPhotoUrls([]);
      setSuccessMessage('Accessibility evidence added to the place profile.');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save evidence.');
    } finally {
      setIsSaving(false);
    }
  }

  if (placeOptions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
        <p className="text-gray-600">No places available yet. Add a place first, then upload photos.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      ) : null}
      {successMessage ? (
        <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">{successMessage}</div>
      ) : null}

      <div>
        <label htmlFor="placeId" className="mb-2 block text-sm font-medium text-gray-700">
          Choose a place
        </label>
        <select
          id="placeId"
          value={placeId}
          onChange={(event) => setPlaceId(event.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          {placeOptions.map((place) => (
            <option key={place.id} value={place.id}>
              {place.label}
            </option>
          ))}
        </select>
      </div>

      <PhotoUploadField
        label="Upload accessibility evidence"
        description="Use clear photos of entrances, ramps, washrooms, sidewalks, transit boarding areas, or current barriers."
        value={photoUrls}
        onChange={setPhotoUrls}
        maxFiles={10}
      />

      <button
        type="submit"
        disabled={isSaving || photoUrls.length === 0}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSaving ? 'Saving evidence...' : 'Add photos to place'}
      </button>
    </form>
  );
}
