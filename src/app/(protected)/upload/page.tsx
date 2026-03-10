import Link from 'next/link';
import { listPlaces } from '@/lib/accesslens/data';
import { UploadEvidenceForm } from '@/components/places/UploadEvidenceForm';

export default async function UploadPage() {
  const places = await listPlaces({ citySlug: 'victoria-bc' });
  const placeOptions = places.map((place) => ({
    id: place._id.toString(),
    label: `${place.name} — ${place.city}, ${place.province}`,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Community upload
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Upload accessibility evidence</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Add photos that show entrances, ramps, path conditions, washrooms, or barriers. Evidence
          helps the community understand what a place is really like before visiting.
        </p>
      </div>

      <UploadEvidenceForm placeOptions={placeOptions} />

      <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900">What makes a helpful upload?</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>• Show the full approach to an entrance when possible.</li>
          <li>• Capture barriers like steps, narrow aisles, construction, or steep slopes.</li>
          <li>• Include context for washrooms, parking, transit boarding, or curb cuts.</li>
          <li>• Avoid faces or personal information in photos when possible.</li>
        </ul>
        <Link
          href="/add-place"
          className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
        >
          Need to add a new place first?
        </Link>
      </div>
    </div>
  );
}
