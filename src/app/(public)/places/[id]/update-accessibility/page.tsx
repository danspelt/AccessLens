'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { PhotoUpload } from '@/components/photos/PhotoUpload';

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

interface PlaceInfo {
  _id: string;
  name: string;
  address: string;
  city: string;
  checklist: Record<string, boolean | undefined>;
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

export default function UpdateAccessibilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistState>(() => {
    const initial: ChecklistState = {};
    CHECKLIST_GROUPS.forEach(({ items }) =>
      items.forEach(({ key }) => (initial[key] = 'unknown'))
    );
    return initial;
  });

  useEffect(() => {
    fetch(`/api/places/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.place) {
          setPlace(data.place);
          const existingChecklist = data.place.checklist || {};
          setChecklist((prev) => {
            const next = { ...prev };
            for (const [key, val] of Object.entries(existingChecklist)) {
              if (val === true) next[key] = 'yes';
              else if (val === false) next[key] = 'no';
            }
            return next;
          });
        }
      })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, [id]);

  function buildChecklistPayload() {
    const result: Record<string, boolean> = {};
    Object.entries(checklist).forEach(([key, val]) => {
      if (val !== 'unknown') result[key] = val === 'yes';
    });
    return result;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/places/${id}/update-accessibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: buildChecklistPayload(),
          notes: notes || undefined,
          photoUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit update.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Failed to submit update. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-600">Loading place information...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Place not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            This place may have been removed or does not exist.
          </p>
          <Link href="/explore" className="mt-4 inline-flex text-sm text-primary-600 underline hover:text-primary-700">
            Back to explore
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Update Submitted</h1>
          <p className="mt-2 text-slate-600">
            Thank you for helping keep accessibility information accurate for <strong>{place.name}</strong>. Your update will be reviewed shortly.
          </p>
          <Link
            href={`/places/${id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to {place.name}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <Link
            href={`/places/${id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to {place.name}
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Accessibility className="h-5 w-5 text-primary-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Suggest an Accessibility Update</h1>
              <p className="text-sm text-slate-500">
                Update accessibility information for <strong>{place.name}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label="Update accessibility information">
          {error && <Alert variant="error">{error}</Alert>}

          <section aria-labelledby="checklist-heading" className="rounded-xl panel-surface p-6">
            <div className="mb-5">
              <h2 id="checklist-heading" className="text-lg font-semibold text-slate-900">Accessibility Checklist</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the items you have information about. Leave as &quot;Unknown&quot; if unsure.
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
          </section>

          <section className="rounded-xl panel-surface p-6">
            <Label htmlFor="update-notes">Additional notes</Label>
            <Textarea
              id="update-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what changed or what needs correcting..."
              rows={4}
              className="mt-1.5"
              maxLength={1000}
            />
          </section>

          <section className="rounded-xl panel-surface p-6">
            <Label>Photos (optional)</Label>
            <p className="mb-2 text-xs text-slate-500">
              Upload photos that show the current accessibility features or barriers.
            </p>
            <PhotoUpload onUpload={setPhotoUrls} context="places" maxFiles={5} />
          </section>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-700">
              Your update will be reviewed before being applied. This helps keep accessibility data accurate and trustworthy.
            </p>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Submit Accessibility Update
          </Button>
        </form>
      </div>
    </div>
  );
}
