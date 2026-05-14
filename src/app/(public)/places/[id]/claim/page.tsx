'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
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
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Place not found</h1>
          <Link href="/explore" className="mt-4 inline-flex text-sm text-primary-600 underline hover:text-primary-700">
            Back to explore
          </Link>
        </div>
      </div>
    );
  }

  if (place.isClaimed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Already Claimed</h1>
          <p className="mt-2 text-sm text-slate-600">
            This listing has already been claimed by its owner or manager.
          </p>
          <Link
            href={`/places/${id}`}
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 underline hover:text-primary-700"
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
        <div className="max-w-md w-full rounded-2xl panel-surface p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Claim Submitted</h1>
          <p className="mt-2 text-slate-600">
            Your claim for <strong>{place.name}</strong> has been submitted and will be reviewed by the AccessLens team. You will be notified once approved.
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
        <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6">
          <Link
            href={`/places/${id}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to {place.name}
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Shield className="h-5 w-5 text-primary-600" aria-hidden="true" />
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

          <section className="rounded-xl panel-surface p-6 space-y-4">
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
              <p className="mt-1 text-xs text-slate-500">
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

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-700">
              Claims are reviewed by the AccessLens team. Once verified, you will be able to manage this listing directly, including updating accessibility info, photos, and contact details.
            </p>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full">
            <Shield className="h-4 w-4" aria-hidden="true" />
            Submit Claim Request
          </Button>
        </form>
      </div>
    </div>
  );
}
