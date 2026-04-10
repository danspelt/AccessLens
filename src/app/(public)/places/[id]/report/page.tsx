'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Flag, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { REPORT_TYPES } from '@/models/Report';

type SessionShape = {
  user?: { id?: string; accountType?: string };
} | null;

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [session, setSession] = useState<SessionShape>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSession(data);
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) {
      setError('Please select an issue type.');
      return;
    }
    if (description.length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: id,
          type,
          description,
          photoUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit report.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    );
  }

  if (session?.user?.accountType === 'business') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl panel-surface p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Reports are for community accounts</h1>
          <p className="mt-2 text-sm text-slate-600">
            Business accounts help by listing places. Community reviewers can file accessibility issue
            reports.
          </p>
          <Link
            href={`/places/${id}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to place
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
            <AlertTriangle className="h-7 w-7 text-green-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Report submitted</h1>
          <p className="mt-2 text-slate-600">
            Thank you for helping keep accessibility information accurate. Your report has been received.
          </p>
          <Link
            href={`/places/${id}`}
            className="link-cta-primary mt-6 gap-2 px-6 py-3 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to place
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
            Back to place
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
              <Flag className="h-5 w-5 text-yellow-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Report an Accessibility Issue</h1>
              <p className="text-sm text-slate-500">Help keep accessibility info current and accurate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-xl panel-surface p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Report accessibility issue">
            {error && <Alert variant="error">{error}</Alert>}

            <div>
              <Label htmlFor="issue-type" required>Issue type</Label>
              <Select
                id="issue-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="mt-1.5"
              >
                <option value="">Select an issue type</option>
                {Object.entries(REPORT_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="issue-description" required>Description</Label>
              <Textarea
                id="issue-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail — what happened, where exactly it is, and when you noticed it…"
                rows={4}
                required
                minLength={10}
                maxLength={1000}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-slate-500">{description.length}/1000 characters</p>
            </div>

            <div>
              <Label>Photos (optional)</Label>
              <div className="mt-1.5">
                <PhotoUpload onUpload={setPhotoUrls} context="reports" maxFiles={3} />
              </div>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs text-yellow-700">
                Your report will be reviewed by the community. Please only report genuine accessibility issues. Thank you for helping keep this information accurate.
              </p>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full" variant="danger">
              Submit Report
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
