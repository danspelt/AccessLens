'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Accessibility, Info, Camera } from 'lucide-react';
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
    <div className="flex items-start justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50/80 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="flex gap-1.5" role="group" aria-label={label}>
        {(['yes', 'no', 'unknown'] as ChecklistValue[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              value === v
                ? v === 'yes'
                  ? 'bg-gradient-to-b from-green-500 to-green-600 text-white shadow-sm ring-1 ring-green-400/30'
                  : v === 'no'
                    ? 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm ring-1 ring-red-400/30'
                    : 'bg-gradient-to-b from-slate-500 to-slate-600 text-white shadow-sm ring-1 ring-slate-400/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700'
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
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-slate-600">Loading place information...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-8 text-center shadow-card">
          <h1 className="text-lg font-bold text-slate-900">Place not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            This place may have been removed or does not exist.
          </p>
          <Link
            href="/explore"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary-500 to-primary-700 px-5 py-2.5 text-sm font-medium text-white shadow-btn-primary ring-1 ring-white/15 transition-[transform,box-shadow] hover:from-primary-500 hover:to-primary-600 active:translate-y-px"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to explore
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-10 text-center shadow-card">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-green-100 to-green-200 shadow-inner">
            <CheckCircle2 className="h-10 w-10 text-green-600 drop-shadow-sm" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Update Submitted!</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Thank you for helping keep accessibility information accurate for <strong className="text-slate-900">{place.name}</strong>. Your update will be reviewed shortly.
          </p>
          <Link
            href={`/places/${id}`}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-primary-500 to-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-btn-primary ring-1 ring-white/15 transition-[transform,box-shadow] hover:from-primary-500 hover:to-primary-600 active:translate-y-px"
          >
            <ArrowLeft className="h-4 w-4 drop-shadow-sm" aria-hidden="true" />
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
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to {place.name}
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-primary-500 to-primary-700 shadow-btn-primary ring-1 ring-white/25">
              <Accessibility className="h-5 w-5 text-white drop-shadow-sm" aria-hidden="true" />
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

          <section aria-labelledby="checklist-heading" className="rounded-2xl panel-surface p-6 sm:p-8 shadow-card">
            <div className="mb-6">
              <h2 id="checklist-heading" className="text-xl font-bold text-slate-900">Accessibility Checklist</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the items you have information about. Leave as &quot;Unknown&quot; if unsure.
              </p>
            </div>
            <div className="space-y-6">
              {CHECKLIST_GROUPS.map(({ title, items }) => (
                <div key={title} className="rounded-xl border border-slate-100 bg-white/50 overflow-hidden">
                  <h3 className="px-4 py-2.5 text-xs font-bold text-primary-700 uppercase tracking-wider bg-gradient-to-r from-primary-50/80 to-transparent border-b border-slate-100">
                    {title}
                  </h3>
                  <div className="px-1">
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

          <section className="rounded-2xl panel-surface p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-primary-600" aria-hidden="true" />
              <Label htmlFor="update-notes" className="text-base font-semibold">Additional notes</Label>
            </div>
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

          <section className="rounded-2xl panel-surface p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-4 w-4 text-primary-600" aria-hidden="true" />
              <Label className="text-base font-semibold">Photos (optional)</Label>
            </div>
            <p className="mb-3 text-sm text-slate-500">
              Upload photos that show the current accessibility features or barriers.
            </p>
            <PhotoUpload onUpload={setPhotoUrls} context="places" maxFiles={5} />
          </section>

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
            <p className="text-sm text-blue-700 leading-relaxed">
              Your update will be reviewed before being applied. This helps keep accessibility data accurate and trustworthy.
            </p>
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full bg-gradient-to-b from-primary-500 to-primary-700 shadow-btn-primary ring-1 ring-white/15 hover:from-primary-500 hover:to-primary-600"
          >
            <Accessibility className="h-4 w-4 drop-shadow-sm" aria-hidden="true" />
            Submit Accessibility Update
          </Button>
        </form>
      </div>
    </div>
  );
}
