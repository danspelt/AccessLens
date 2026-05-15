'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { ProfileSectionStep } from '@/components/business/ProfileSectionStep';
import type { ProfileSectionKey } from '@/components/business/wizardQuestions';
import type { AccessibilityProfile, ExtraFeature } from '@/models/AccessibilityProfile';
import { EXTRA_FEATURE_LABELS } from '@/models/AccessibilityProfile';
import { profileToPublicTags } from '@/lib/accessibility/tags';
import { PARTNER_LABEL_DISPLAY } from '@/models/Place';

const EXTRA_FEATURES: ExtraFeature[] = [
  'quiet_hours',
  'staff_training',
  'accessible_website',
  'assistance_on_request',
  'delivery_curbside',
  'online_booking',
  'accessible_seating',
  'gender_neutral_washroom',
  'visual_signage',
  'multilingual_support',
];

type PlaceSummary = {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  businessContact: { name: string; email: string; phone?: string; role: string } | null;
  accessibilityProfile: AccessibilityProfile | null;
  accessibilityNotes: string | null;
  photoUrls: string[];
};

const STEPS = [
  'confirm',
  'claim',
  'entrance',
  'interior',
  'washroom',
  'communication',
  'sensory',
  'transport',
  'extras',
  'notes',
  'photos',
  'preview',
] as const;

export function BusinessAccessWizard({
  code,
  initialPlace,
}: {
  code: string;
  initialPlace: PlaceSummary;
}) {
  const [place, setPlace] = useState(initialPlace);
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const [profile, setProfile] = useState<AccessibilityProfile>(
    () => initialPlace.accessibilityProfile ?? {}
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialPlace.photoUrls ?? []);
  const [contactName, setContactName] = useState(place.businessContact?.name ?? '');
  const [contactEmail, setContactEmail] = useState(place.businessContact?.email ?? '');
  const [contactPhone, setContactPhone] = useState(place.businessContact?.phone ?? '');
  const [role, setRole] = useState(place.businessContact?.role ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);
  const publicTags = useMemo(() => profileToPublicTags(profile), [profile]);

  const patchProfile = useCallback((patch: Partial<AccessibilityProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  async function saveClaim() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/business/access/${code}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName,
          contactEmail,
          contactPhone: contactPhone || undefined,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save contact info');
        return false;
      }
      setPlace((p) => ({
        ...p,
        businessContact: { name: contactName, email: contactEmail, phone: contactPhone, role },
      }));
      return true;
    } catch {
      setError('Could not save contact info');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function submit(publish: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/business/access/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { ...profile, publicNotes: profile.publicNotes },
          photoUrls,
          publish,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save');
        return;
      }
      setDone(true);
    } catch {
      setError('Could not save');
    } finally {
      setLoading(false);
    }
  }

  async function goNext() {
    if (step === 'claim') {
      if (!contactName || !contactEmail || !role) {
        setError('Please fill in your name, email, and role');
        return;
      }
      const ok = await saveClaim();
      if (!ok) return;
    }
    setError(null);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  if (done) {
    return <SuccessScreen placeName={place.name} placeId={place.id} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            AccessLens · Community accessibility project
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{place.name}</h1>
          <p className="text-sm text-slate-500">
            {place.address}, {place.city}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 pb-24">
        {error ? (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        ) : null}

        {step === 'confirm' && (
          <StepCard title="Is this your business?">
            <p className="text-slate-600 leading-relaxed">
              You&apos;re updating accessibility information for{' '}
              <strong className="text-slate-900">{place.name}</strong>. This helps visitors know what
              access looks like before they arrive.
            </p>
            <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Participating businesses are listed as an{' '}
              <strong>{PARTNER_LABEL_DISPLAY.accessibility_partner}</strong>.
            </p>
          </StepCard>
        )}

        {step === 'claim' && (
          <StepCard title="Your contact info">
            <p className="mb-4 text-sm text-slate-600">Short form only — no account password needed.</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactName">Your name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-1 text-lg"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1 text-lg"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone (optional)</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-1 text-lg"
                />
              </div>
              <div>
                <Label htmlFor="role">Your role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg"
                >
                  <option value="">Select…</option>
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </StepCard>
        )}

        {(step === 'entrance' ||
          step === 'interior' ||
          step === 'washroom' ||
          step === 'communication' ||
          step === 'sensory' ||
          step === 'transport') && (
          <ProfileSectionStep
            sectionKey={step as ProfileSectionKey}
            profile={profile}
            onChange={setProfile}
          />
        )}

        {step === 'extras' && (
          <StepCard title="Extra features (optional)">
            <p className="mb-4 text-sm text-slate-600">Tap any that apply to your business.</p>
            <div className="flex flex-wrap gap-2">
              {EXTRA_FEATURES.map((f) => {
                const selected = profile.extraFeatures?.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      const current = profile.extraFeatures ?? [];
                      patchProfile({
                        extraFeatures: selected
                          ? current.filter((x) => x !== f)
                          : [...current, f],
                      });
                    }}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-primary-600 bg-primary-50 text-primary-800'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {EXTRA_FEATURE_LABELS[f]}
                  </button>
                );
              })}
            </div>
          </StepCard>
        )}

        {step === 'notes' && (
          <StepCard title="Notes for visitors">
            <p className="mb-3 text-sm text-slate-600">
              Anything people should know before arriving? (e.g. side entrance, portable ramp)
            </p>
            <Textarea
              value={profile.publicNotes ?? ''}
              onChange={(e) => patchProfile({ publicNotes: e.target.value })}
              rows={5}
              maxLength={500}
              className="text-lg"
              placeholder="Best entrance is through the side door…"
            />
          </StepCard>
        )}

        {step === 'photos' && (
          <StepCard title="Photos (optional)">
            <p className="mb-4 text-sm text-slate-600">
              Photos of entrance, parking, or washroom help visitors trust your listing.
            </p>
            <PhotoUpload
              onUpload={setPhotoUrls}
              context="places"
              maxFiles={6}
              uploadEndpoint={`/api/business/access/${code}/upload`}
            />
          </StepCard>
        )}

        {step === 'preview' && (
          <StepCard title="Preview your public listing">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-primary-700">
                <Building2 className="h-5 w-5" aria-hidden="true" />
                <span className="font-bold text-slate-900">{place.name}</span>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Accessibility features</p>
              <ul className="mt-2 space-y-1">
                {publicTags.length === 0 ? (
                  <li className="text-sm text-slate-500">Add answers above to generate tags.</li>
                ) : (
                  publicTags.map((t) => (
                    <li key={t.id} className="text-sm text-slate-800">
                      {t.status === 'positive' ? '✅' : t.status === 'partial' ? '⚠️' : '·'} {t.label}
                    </li>
                  ))
                )}
              </ul>
              {profile.publicNotes ? (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase text-slate-500">Notes</p>
                  <p className="text-sm italic text-slate-700">&ldquo;{profile.publicNotes}&rdquo;</p>
                </>
              ) : null}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Button type="button" size="lg" loading={loading} className="w-full" onClick={() => submit(true)}>
                Publish for review
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                loading={loading}
                className="w-full"
                onClick={() => submit(false)}
              >
                Save draft
              </Button>
            </div>
          </StepCard>
        )}
      </main>

      {step !== 'preview' && (
        <footer className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-lg gap-3">
            {stepIndex > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            ) : (
              <div className="flex-1" />
            )}
            <Button type="button" onClick={goNext} loading={loading} className="flex-[2]">
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl panel-surface p-6 shadow-card">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SuccessScreen({ placeName, placeId }: { placeName: string; placeId: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl panel-surface p-10 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Thank you!</h1>
        <p className="mt-3 text-slate-600">
          <strong>{placeName}</strong> is on its way to being listed as an Accessibility Partner. We&apos;ll
          review your update shortly.
        </p>
        <Link
          href={`/places/${placeId}`}
          className="mt-8 inline-block font-semibold text-primary-600 hover:underline"
        >
          View public page
        </Link>
      </div>
    </div>
  );
}
