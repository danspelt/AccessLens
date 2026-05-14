'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Accessibility,
  UserCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { PlaceSearchBeforeAdd } from '@/components/places/PlaceSearchBeforeAdd';
import { PLACE_CATEGORIES, CATEGORY_ICONS, type PlaceCategory } from '@/models/Place';
import { SUBMITTER_ROLES, type SubmitterRole } from '@/models/PlaceSubmission';

const CHECKLIST_GROUPS = [
  {
    title: 'Entrance',
    items: [
      { key: 'entranceRamp', label: 'Entrance ramp or level access', description: 'No steps required to enter' },
      { key: 'automaticDoor', label: 'Automatic door opener', description: 'Push button or sensor doors' },
      { key: 'levelEntrance', label: 'Level entrance', description: 'No lips or raised edges at entrance' },
    ],
  },
  {
    title: 'Washroom',
    items: [
      { key: 'accessibleWashroom', label: 'Accessible washroom', description: 'Accessible toilet with grab bars' },
      { key: 'genderNeutralWashroom', label: 'Gender-neutral washroom', description: 'Non-gendered washroom available' },
    ],
  },
  {
    title: 'Parking & Drop-off',
    items: [
      { key: 'accessibleParking', label: 'Accessible parking', description: 'Designated accessible parking nearby' },
      { key: 'transitAccessible', label: 'Transit accessible', description: 'Accessible transit stop within 1 block' },
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
    title: 'Sensory & Communication',
    items: [
      { key: 'brailleSignage', label: 'Braille signage', description: 'Tactile signage for visually impaired' },
      { key: 'audioAnnouncements', label: 'Audio announcements', description: 'Audio cues or announcements' },
      { key: 'serviceAnimalWelcome', label: 'Service animals welcome', description: 'Explicitly welcomes service animals' },
      { key: 'quietSpace', label: 'Quiet space available', description: 'Low-stimulation area available' },
    ],
  },
];

type ChecklistValue = 'yes' | 'no' | 'unknown';
type ChecklistState = Record<string, ChecklistValue>;

const STEPS = [
  { id: 'search', label: 'Check Listing', icon: Building2 },
  { id: 'basic', label: 'Place Info', icon: Info },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'submitter', label: 'Your Info', icon: UserCircle },
  { id: 'review', label: 'Review & Submit', icon: Send },
] as const;

type StepId = typeof STEPS[number]['id'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isComplete = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <li
              key={step.id}
              className="flex flex-1 items-center"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                    isComplete
                      ? 'border-green-500 bg-green-500 text-white'
                      : isCurrent
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-none sm:text-xs ${
                    isCurrent ? 'text-primary-700' : isComplete ? 'text-green-700' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 mt-[-1.25rem] h-0.5 flex-1 sm:mx-2 ${
                    i < currentStep ? 'bg-green-400' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

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

export default function NewPlacePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const currentStepId = STEPS[step].id;

  // Step 2: Basic info
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Victoria');
  const [province, setProvince] = useState('BC');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  // Step 3: Location
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [entrancePinned, setEntrancePinned] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeHint, setGeocodeHint] = useState<string | null>(null);

  // Step 4: Accessibility
  const [checklist, setChecklist] = useState<ChecklistState>(() => {
    const initial: ChecklistState = {};
    CHECKLIST_GROUPS.forEach(({ items }) =>
      items.forEach(({ key }) => (initial[key] = 'unknown'))
    );
    return initial;
  });
  const [generalNotes, setGeneralNotes] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Step 5: Submitter
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitterRole, setSubmitterRole] = useState<SubmitterRole | ''>('');
  const [isOwnerOrManager, setIsOwnerOrManager] = useState<string>('');

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill from session
  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.name) setSubmitterName(data.user.name);
        if (data?.user?.email) setSubmitterEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  function buildChecklistPayload() {
    const result: Record<string, boolean> = {};
    Object.entries(checklist).forEach(([key, val]) => {
      if (val !== 'unknown') result[key] = val === 'yes';
    });
    return result;
  }

  function validateBasicInfo() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Place name is required';
    if (!category) errs.category = 'Category is required';
    if (!address.trim()) errs.address = 'Address is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!province.trim()) errs.province = 'Province is required';
    if (website && !website.startsWith('http')) errs.website = 'Website must start with http:// or https://';
    if (email && !email.includes('@')) errs.email = 'Invalid email address';
    return errs;
  }

  function validateLocation() {
    const errs: Record<string, string> = {};
    if (latitude && isNaN(parseFloat(latitude))) errs.latitude = 'Invalid latitude';
    if (longitude && isNaN(parseFloat(longitude))) errs.longitude = 'Invalid longitude';
    return errs;
  }

  function validateSubmitter() {
    const errs: Record<string, string> = {};
    if (!submitterName.trim()) errs.submitterName = 'Your name is required';
    if (!submitterEmail.trim()) errs.submitterEmail = 'Your email is required';
    if (submitterEmail && !submitterEmail.includes('@')) errs.submitterEmail = 'Invalid email address';
    if (!submitterRole) errs.submitterRole = 'Please select your role';
    if (!isOwnerOrManager) errs.isOwnerOrManager = 'Please answer this question';
    return errs;
  }

  function handleNext() {
    setErrors({});
    setError(null);

    if (currentStepId === 'basic') {
      const errs = validateBasicInfo();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
    }

    if (currentStepId === 'location') {
      const errs = validateLocation();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
    }

    if (currentStepId === 'submitter') {
      const errs = validateSubmitter();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setErrors({});
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
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

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        placeData: {
          name,
          category,
          address,
          city,
          province,
          postalCode: postalCode || undefined,
          country: 'Canada',
          phone: phone || undefined,
          website: website || undefined,
          email: email || undefined,
          description: description || undefined,
        },
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        entrancePinned,
        accessibilityData: {
          checklist: buildChecklistPayload(),
          generalNotes: generalNotes || undefined,
        },
        photoUrls,
        submitter: {
          name: submitterName,
          email: submitterEmail,
          role: submitterRole,
          isOwnerOrManager: isOwnerOrManager === 'yes' || isOwnerOrManager === 'work_here',
        },
      };

      const res = await fetch('/api/place-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Place Submitted</h1>
          <p className="mt-3 text-slate-600">
            Thank you for contributing to AccessLens. Your submission for <strong>{name}</strong> has been received and will be reviewed before appearing publicly.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Explore Places
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setStep(0);
                setName('');
                setCategory('');
                setAddress('');
                setDescription('');
                setGeneralNotes('');
                setPhotoUrls([]);
              }}
              className="text-sm text-primary-600 underline hover:text-primary-700"
            >
              Add another place
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Building2 className="h-5 w-5 text-primary-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Add a Place to AccessLens</h1>
              <p className="text-sm text-slate-500">
                Help people find accessible places by adding a business, public space, or community location.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {step > 0 && <StepIndicator currentStep={step} />}

        {error && <Alert variant="error" title="Error" className="mb-6">{error}</Alert>}

        {/* Step 0: Search before adding */}
        {currentStepId === 'search' && (
          <div className="rounded-xl panel-surface p-6">
            <PlaceSearchBeforeAdd onProceedToAdd={() => setStep(1)} />
          </div>
        )}

        {/* Step 1: Basic Place Information */}
        {currentStepId === 'basic' && (
          <section aria-labelledby="basic-heading" className="rounded-xl panel-surface p-6">
            <h2 id="basic-heading" className="mb-5 text-lg font-semibold text-slate-900">
              Basic Place Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="place-name" required>Place name</Label>
                <Input
                  id="place-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Blue Fox Cafe"
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
                      {CATEGORY_ICONS[slug as PlaceCategory]} {label}
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
                  placeholder="e.g. 919 Fort St"
                  required
                  error={errors.address}
                  className="mt-1.5"
                />
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="place-city" required>City</Label>
                  <Input
                    id="place-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    error={errors.city}
                    className="mt-1.5"
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="place-province" required>Province</Label>
                  <Input
                    id="place-province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    error={errors.province}
                    className="mt-1.5"
                  />
                  {errors.province && <p className="mt-1 text-xs text-red-600">{errors.province}</p>}
                </div>
                <div>
                  <Label htmlFor="place-postal">Postal code</Label>
                  <Input
                    id="place-postal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="V8V 3K3"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="place-description">Description (optional)</Label>
                <Textarea
                  id="place-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the place..."
                  rows={3}
                  className="mt-1.5"
                  maxLength={2000}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
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
                  <Label htmlFor="place-email">Business email (optional)</Label>
                  <Input
                    id="place-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@example.com"
                    error={errors.email}
                    className="mt-1.5"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Location */}
        {currentStepId === 'location' && (
          <section aria-labelledby="location-heading" className="rounded-xl panel-surface p-6">
            <div className="mb-5">
              <h2 id="location-heading" className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" aria-hidden="true" />
                Map Coordinates
                <span className="text-sm font-normal text-slate-500">(optional)</span>
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Add coordinates to show this place on the map. If possible, pin the accessible entrance location.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={geocodeFromAddress}
                disabled={geocoding || !address.trim()}
              >
                {geocoding ? 'Finding...' : 'Find coordinates from address'}
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

            <label className="mt-4 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={entrancePinned}
                onChange={(e) => setEntrancePinned(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">This pin marks the accessible entrance</span>
            </label>
          </section>
        )}

        {/* Step 3: Accessibility */}
        {currentStepId === 'accessibility' && (
          <section aria-labelledby="checklist-heading" className="rounded-xl panel-surface p-6">
            <div className="mb-5">
              <h2 id="checklist-heading" className="text-lg font-semibold text-slate-900">
                Accessibility Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Answer what you know. &quot;Unknown&quot; is perfectly fine if you are not sure.
              </p>
            </div>

            <div className="space-y-6">
              {CHECKLIST_GROUPS.map(({ title, items }) => (
                <div key={title}>
                  <h3 className="mb-1 text-sm font-semibold text-primary-700 uppercase tracking-wide">{title}</h3>
                  <div>
                    {items.map(({ key, label, description: desc }) => (
                      <ChecklistToggle
                        key={key}
                        label={label}
                        description={desc}
                        value={checklist[key]}
                        onChange={(v) => setChecklist((c) => ({ ...c, [key]: v }))}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <Label htmlFor="general-notes">Additional accessibility notes</Label>
              <Textarea
                id="general-notes"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Anything else the community should know about accessibility at this place..."
                rows={3}
                className="mt-1.5"
                maxLength={1000}
              />
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <Label>Accessibility photos (optional)</Label>
              <p className="mb-2 text-xs text-slate-500">
                Upload photos of the entrance, ramps, washrooms, and other accessibility features.
              </p>
              <PhotoUpload onUpload={setPhotoUrls} context="places" maxFiles={5} />
            </div>
          </section>
        )}

        {/* Step 4: Submitter Info */}
        {currentStepId === 'submitter' && (
          <section aria-labelledby="submitter-heading" className="rounded-xl panel-surface p-6">
            <h2 id="submitter-heading" className="mb-5 text-lg font-semibold text-slate-900">
              Your Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="submitter-name" required>Your name</Label>
                <Input
                  id="submitter-name"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  error={errors.submitterName}
                  className="mt-1.5"
                />
                {errors.submitterName && <p className="mt-1 text-xs text-red-600">{errors.submitterName}</p>}
              </div>

              <div>
                <Label htmlFor="submitter-email" required>Your email</Label>
                <Input
                  id="submitter-email"
                  type="email"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  error={errors.submitterEmail}
                  className="mt-1.5"
                />
                {errors.submitterEmail && <p className="mt-1 text-xs text-red-600">{errors.submitterEmail}</p>}
              </div>

              <div>
                <Label htmlFor="submitter-role" required>Your role</Label>
                <Select
                  id="submitter-role"
                  value={submitterRole}
                  onChange={(e) => setSubmitterRole(e.target.value as SubmitterRole)}
                  required
                  error={errors.submitterRole}
                  className="mt-1.5"
                >
                  <option value="">Select your role</option>
                  {Object.entries(SUBMITTER_ROLES).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </Select>
                {errors.submitterRole && <p className="mt-1 text-xs text-red-600">{errors.submitterRole}</p>}
              </div>

              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-slate-800">
                  Are you the owner or manager of this place? <span className="text-red-500">*</span>
                </legend>
                <div className="mt-2 space-y-2">
                  {[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                    { value: 'work_here', label: 'I work here' },
                    { value: 'visitor', label: 'I am a visitor / community member' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isOwnerOrManager"
                        value={opt.value}
                        checked={isOwnerOrManager === opt.value}
                        onChange={(e) => setIsOwnerOrManager(e.target.value)}
                        className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.isOwnerOrManager && <p className="mt-1 text-xs text-red-600">{errors.isOwnerOrManager}</p>}
              </fieldset>

              {(isOwnerOrManager === 'yes' || isOwnerOrManager === 'work_here') && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-sm text-blue-700">
                    After your submission is approved, you can claim this listing to manage it as the owner or authorized representative.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 5: Review & Submit */}
        {currentStepId === 'review' && (
          <div className="space-y-6">
            <section className="rounded-xl panel-surface p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Review Your Submission</h2>

              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-700">Place Information</h3>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-slate-500 w-24 shrink-0">Name:</dt>
                      <dd className="text-slate-900 font-medium">{name}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-slate-500 w-24 shrink-0">Category:</dt>
                      <dd className="text-slate-900">
                        {CATEGORY_ICONS[category as PlaceCategory]} {PLACE_CATEGORIES[category as PlaceCategory]}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-slate-500 w-24 shrink-0">Address:</dt>
                      <dd className="text-slate-900">{address}, {city}, {province} {postalCode}</dd>
                    </div>
                    {website && (
                      <div className="flex gap-2">
                        <dt className="text-slate-500 w-24 shrink-0">Website:</dt>
                        <dd className="text-slate-900 truncate">{website}</dd>
                      </div>
                    )}
                    {phone && (
                      <div className="flex gap-2">
                        <dt className="text-slate-500 w-24 shrink-0">Phone:</dt>
                        <dd className="text-slate-900">{phone}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-700">Accessibility</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(checklist)
                      .filter(([, val]) => val === 'yes')
                      .map(([key]) => {
                        const item = CHECKLIST_GROUPS.flatMap((g) => g.items).find((i) => i.key === key);
                        return (
                          <span key={key} className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            ✓ {item?.label || key}
                          </span>
                        );
                      })}
                    {Object.entries(checklist)
                      .filter(([, val]) => val === 'no')
                      .map(([key]) => {
                        const item = CHECKLIST_GROUPS.flatMap((g) => g.items).find((i) => i.key === key);
                        return (
                          <span key={key} className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            ✗ {item?.label || key}
                          </span>
                        );
                      })}
                    {Object.entries(checklist).every(([, val]) => val === 'unknown') && (
                      <span className="text-xs text-slate-500">No accessibility information provided yet</span>
                    )}
                  </div>
                  {generalNotes && (
                    <p className="mt-2 text-xs text-slate-600">Notes: {generalNotes}</p>
                  )}
                  {photoUrls.length > 0 && (
                    <p className="mt-2 text-xs text-slate-600">{photoUrls.length} photo{photoUrls.length !== 1 ? 's' : ''} attached</p>
                  )}
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-700">Submitted By</h3>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-slate-500 w-24 shrink-0">Name:</dt>
                      <dd className="text-slate-900">{submitterName}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-slate-500 w-24 shrink-0">Email:</dt>
                      <dd className="text-slate-900">{submitterEmail}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-slate-500 w-24 shrink-0">Role:</dt>
                      <dd className="text-slate-900">{SUBMITTER_ROLES[submitterRole as SubmitterRole] || submitterRole}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>

            <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
              <p className="text-sm text-blue-700">
                Your submission will be reviewed by the AccessLens team before appearing publicly. This helps us maintain accurate and trustworthy accessibility data.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step > 0 && (
          <div className="mt-8 flex justify-between gap-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>

            {currentStepId === 'review' ? (
              <Button type="button" onClick={handleSubmit} loading={loading} size="lg">
                <Send className="h-4 w-4" aria-hidden="true" />
                Submit Place for Review
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
