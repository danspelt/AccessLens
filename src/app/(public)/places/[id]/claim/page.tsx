'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Shield, Info, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';

interface PlaceInfo {
  _id: string;
  name: string;
  address: string;
  city: string;
  isClaimed?: boolean;
}

export default function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [role, setRole] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/places/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.place) setPlace(data.place);
      })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, [id]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!role) errs.role = 'Please select your role';
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
      const res = await fetch(`/api/places/${id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          businessEmail: businessEmail || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit claim.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-8 text-center shadow-card">
          <h1 className="text-lg font-bold text-slate-900">Place not found</h1>
          <p className="mt-2 text-sm text-slate-600">This place may have been removed or does not exist.</p>
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

  if (place.isClaimed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-10 text-center shadow-card">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Shield className="h-8 w-8 text-slate-400" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Already Claimed</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            This listing has already been claimed by its owner or manager.
          </p>
          <Link
            href={`/places/${id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-300/90 bg-gradient-to-b from-white to-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-btn-outline transition-[transform,box-shadow] hover:to-slate-100 active:translate-y-px"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to {place.name}
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
          <h1 className="text-2xl font-bold text-slate-900">Claim Submitted!</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Your claim for <strong className="text-slate-900">{place.name}</strong> has been submitted and will be reviewed by the AccessLens team. You will be notified once approved.
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
        <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6">
          <Link
            href={`/places/${id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to {place.name}
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-primary-500 to-primary-700 shadow-btn-primary ring-1 ring-white/25">
              <Shield className="h-5 w-5 text-white drop-shadow-sm" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Claim This Listing</h1>
              <p className="text-sm text-slate-500">
                Claim <strong>{place.name}</strong> as the owner or manager
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label="Claim this listing">
          {error && <Alert variant="error">{error}</Alert>}

          {/* What claiming does */}
          <div className="rounded-2xl border border-primary-200 bg-gradient-to-b from-primary-50/80 to-primary-50/30 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-primary-800">What does claiming do?</p>
                <p className="mt-1 text-sm text-primary-700 leading-relaxed">
                  Once verified, you will be able to manage this listing directly &mdash; including updating accessibility info, photos, and contact details.
                </p>
              </div>
            </div>
          </div>

          <section className="rounded-2xl panel-surface p-6 sm:p-8 shadow-card space-y-5">
            <div>
              <Label htmlFor="claim-role" required>Your role at this business</Label>
              <Select
                id="claim-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                error={errors.role}
                className="mt-1.5"
              >
                <option value="">Select your role</option>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
                <option value="authorized_representative">Authorized Representative</option>
              </Select>
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
            </div>

            <div>
              <Label htmlFor="claim-email">Business email (for verification)</Label>
              <Input
                id="claim-email"
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="manager@business.com"
                className="mt-1.5"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                If the email domain matches the business website, this speeds up verification.
              </p>
            </div>

            <div>
              <Label htmlFor="claim-notes">Additional verification notes</Label>
              <Textarea
                id="claim-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us how we can verify your connection to this business..."
                rows={3}
                className="mt-1.5"
                maxLength={1000}
              />
            </div>
          </section>

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
            <p className="text-sm text-blue-700 leading-relaxed">
              Claims are reviewed by the AccessLens team. You will receive a notification once your claim has been verified.
            </p>
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full bg-gradient-to-b from-primary-500 to-primary-700 shadow-btn-primary ring-1 ring-white/15 hover:from-primary-500 hover:to-primary-600"
          >
            <Shield className="h-4 w-4 drop-shadow-sm" aria-hidden="true" />
            Submit Claim Request
          </Button>
        </form>
      </div>
    </div>
  );
}
