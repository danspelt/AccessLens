'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { PLACE_CATEGORIES, CATEGORY_ICONS } from '@/models/Place';
import { MapPin, Building2, Info } from 'lucide-react';

const CHECKLIST_GROUPS = [
  {
    title: 'Entrance & Access',
    items: [
      { key: 'entranceRamp', label: 'Entrance ramp or level access', description: 'No steps required to enter' },
      { key: 'automaticDoor', label: 'Automatic door opener', description: 'Push button or sensor doors' },
      { key: 'levelEntrance', label: 'Level entrance', description: 'No lips or raised edges at entrance' },
    ],
  },
  {
    title: 'Interior',
    items: [
      { key: 'elevator', label: 'Elevator to all floors', description: 'Accessible elevator available' },
      { key: 'wideAisles', label: 'Wide aisles (36"+)', description: 'Aisles wide enough for wheelchairs' },
      { key: 'accessibleSeating', label: 'Accessible seating', description: 'Dedicated accessible seating areas' },
    ],
  },
  {
    title: 'Washrooms',
    items: [
      { key: 'accessibleWashroom', label: 'Accessible washroom', description: 'Accessible toilet with grab bars' },
      { key: 'genderNeutralWashroom', label: 'Gender-neutral washroom', description: 'Non-gendered washroom available' },
    ],
  },
  {
    title: 'Parking & Transit',
    items: [
      { key: 'accessibleParking', label: 'Accessible parking', description: 'Designated accessible parking nearby' },
      { key: 'transitAccessible', label: 'Transit accessible', description: 'Accessible transit stop within 1 block' },
    ],
  },
  {
    title: 'Signage & Communication',
    items: [
      { key: 'brailleSignage', label: 'Braille signage', description: 'Tactile signage for visually impaired' },
      { key: 'audioAnnouncements', label: 'Audio announcements', description: 'Audio cues or announcements' },
    ],
  },
  {
    title: 'Additional',
    items: [
      { key: 'serviceAnimalWelcome', label: 'Service animals welcome', description: 'Explicitly welcomes service animals' },
      { key: 'quietSpace', label: 'Quiet space available', description: 'Low-stimulation area available' },
    ],
  },
];

type ChecklistValue = 'yes' | 'no' | 'unknown';
type ChecklistState = Record<string, ChecklistValue>;

function ChecklistToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: ChecklistValue;
  onChange: (v: ChecklistValue) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="flex gap-1" role="group" aria-label={label}>
        {(['yes', 'no', 'unknown'] as ChecklistValue[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              value === v
                ? v === 'yes'
                  ? 'bg-green-600 text-white'
                  : v === 'no'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {v === 'yes' ? '✓ Yes' : v === 'no' ? '✗ No' : '? Unknown'}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddPlaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Victoria');
  const [province, setProvince] = useState('BC');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeHint, setGeocodeHint] = useState<string | null>(null);
  const [accessibilityNotes, setAccessibilityNotes] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const [checklist, setChecklist] = useState<ChecklistState>(() => {
    const initial: ChecklistState = {};
    CHECKLIST_GROUPS.forEach(({ items }) =>
      items.forEach(({ key }) => (initial[key] = 'unknown'))
    );
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const latRaw = searchParams.get('lat');
    const lngRaw = searchParams.get('lng');
    if (latRaw === null || lngRaw === null || latRaw === '' || lngRaw === '') return;
    const plat = Number(latRaw);
    const plng = Number(lngRaw);
    if (!Number.isFinite(plat) || !Number.isFinite(plng)) return;
    if (plat < -90 || plat > 90 || plng < -180 || plng > 180) return;
    setLatitude(String(plat));
    setLongitude(String(plng));
    setGeocodeHint('Coordinates loaded from the map.');
  }, [searchParams]);

  function buildChecklistPayload() {
    const result: Record<string, boolean> = {};
    Object.entries(checklist).forEach(([key, val]) => {
      if (val !== 'unknown') result[key] = val === 'yes';
    });
    return result;
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!category) errs.category = 'Category is required';
    if (!address.trim()) errs.address = 'Address is required';
    if (latitude && isNaN(parseFloat(latitude))) errs.latitude = 'Invalid latitude';
    if (longitude && isNaN(parseFloat(longitude))) errs.longitude = 'Invalid longitude';
    if (website && !website.startsWith('http')) errs.website = 'Website must start with http:// or https://';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        category,
        address,
        city,
        citySlug: 'victoria-bc',
        province,
        country: 'Canada',
        description: description || undefined,
        website: website || undefined,
        phone: phone || undefined,
        checklist: buildChecklistPayload(),
        accessibilityNotes: accessibilityNotes || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      };

      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add place.');
        return;
      }

      // If photos were uploaded, attach them to the place
      if (photoUrls.length > 0) {
        await fetch(`/api/places/${data.place.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoUrls }),
        });
      }

      router.push(`/places/${data.place.id}`);
    } catch {
      setError('Failed to add place. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function geocodeFromAddress() {
    const q = [address, city, province, 'Canada'].filter(Boolean).join(', ').trim();
    if (q.length < 3) return;
    setGeocoding(true);
    setGeocodeHint(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setGeocodeHint(data?.error || 'Could not find coordinates for this address.');
        return;
      }
      setLatitude(String(data.lat));
      setLongitude(String(data.lon));
      if (data.displayName) setGeocodeHint(`Found: ${data.displayName}`);
    } catch {
      setGeocodeHint('Could not geocode right now. Please try again.');
    } finally {
      setGeocoding(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Building2 className="h-5 w-5 text-primary-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Add a Place</h1>
              <p className="text-sm text-slate-500">Help the community by adding a place and its accessibility information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-8" aria-label="Add a new place">
          {error && <Alert variant="error" title="Error">{error}</Alert>}

          {/* Basic info */}
          <section aria-labelledby="basic-info-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 id="basic-info-heading" className="mb-5 text-lg font-semibold text-slate-900">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="place-name" required>Place name</Label>
                <Input
                  id="place-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Victoria Public Library"
                  required
                  error={errors.name}
                  className="mt-1.5"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="place-category" required>Category</Label>
                <Select
                  id="place-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  error={errors.category}
                  className="mt-1.5"
                >
                  <option value="">Select a category</option>
                  {Object.entries(PLACE_CATEGORIES).map(([slug, label]) => (
                    <option key={slug} value={slug}>
                      {CATEGORY_ICONS[slug as keyof typeof CATEGORY_ICONS]} {label}
                    </option>
                  ))}
                </Select>
                {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="place-address" required>Street address</Label>
                <Input
                  id="place-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 735 Broughton St"
                  required
                  error={errors.address}
                  className="mt-1.5"
                />
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="place-city">City</Label>
                  <Input
                    id="place-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="place-province">Province</Label>
                  <Input
                    id="place-province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="place-description">Description</Label>
                <Textarea
                  id="place-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the place…"
                  rows={3}
                  className="mt-1.5"
                  maxLength={2000}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="place-website">Website (optional)</Label>
                  <Input
                    id="place-website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    error={errors.website}
                    className="mt-1.5"
                  />
                  {errors.website && <p className="mt-1 text-xs text-red-600">{errors.website}</p>}
                </div>
                <div>
                  <Label htmlFor="place-phone">Phone (optional)</Label>
                  <Input
                    id="place-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="250-555-0100"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Location coordinates */}
          <section aria-labelledby="location-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="mb-5 flex items-start gap-3">
              <div>
                <h2 id="location-heading" className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  Map Coordinates
                  <span className="text-sm font-normal text-slate-500">(optional)</span>
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add coordinates to show this place on the map. You can auto-fill from the address below.
                </p>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={geocodeFromAddress}
                disabled={geocoding || !address.trim()}
              >
                {geocoding ? 'Finding…' : 'Find coordinates from address'}
              </Button>
              {geocodeHint && <p className="text-xs text-slate-500">{geocodeHint}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="place-lat">Latitude</Label>
                <Input
                  id="place-lat"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="48.4284"
                  error={errors.latitude}
                  className="mt-1.5"
                />
                {errors.latitude && <p className="mt-1 text-xs text-red-600">{errors.latitude}</p>}
              </div>
              <div>
                <Label htmlFor="place-lng">Longitude</Label>
                <Input
                  id="place-lng"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-123.3656"
                  error={errors.longitude}
                  className="mt-1.5"
                />
                {errors.longitude && <p className="mt-1 text-xs text-red-600">{errors.longitude}</p>}
              </div>
            </div>
          </section>

          {/* Accessibility checklist */}
          <section aria-labelledby="checklist-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="mb-5">
              <h2 id="checklist-heading" className="text-lg font-semibold text-slate-900">Accessibility Checklist</h2>
              <p className="mt-1 text-sm text-slate-500">
                Answer what you know. &quot;Unknown&quot; is fine if you&apos;re not sure.
              </p>
            </div>
            <div className="space-y-6">
              {CHECKLIST_GROUPS.map(({ title, items }) => (
                <div key={title}>
                  <h3 className="mb-1 text-sm font-semibold text-primary-700 uppercase tracking-wide">{title}</h3>
                  <div>
                    {items.map(({ key, label, description }) => (
                      <ChecklistToggle
                        key={key}
                        label={label}
                        description={description}
                        value={checklist[key]}
                        onChange={(v) => setChecklist((c) => ({ ...c, [key]: v }))}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <Label htmlFor="accessibility-notes">Additional accessibility notes</Label>
              <Textarea
                id="accessibility-notes"
                value={accessibilityNotes}
                onChange={(e) => setAccessibilityNotes(e.target.value)}
                placeholder="Anything else the community should know about accessibility at this place…"
                rows={3}
                className="mt-1.5"
                maxLength={1000}
              />
            </div>
          </section>

          {/* Photos */}
          <section aria-labelledby="photos-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="mb-4">
              <h2 id="photos-heading" className="text-lg font-semibold text-slate-900">Accessibility Photos</h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload photos of the entrance, ramps, washrooms, and other accessibility features.
              </p>
            </div>
            <PhotoUpload onUpload={setPhotoUrls} context="places" maxFiles={5} />
          </section>

          {/* Info note */}
          <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
            <p className="text-sm text-blue-700">
              Your submission will be visible immediately. The community can add reviews and photos to improve the information over time. Thank you for contributing!
            </p>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Add Place to AccessLens
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AddPlacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Loading add place form" />
      }
    >
      <AddPlaceForm />
    </Suspense>
  );
}
