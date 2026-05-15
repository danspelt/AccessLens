'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/ui/Alert';
import { BarChart3, KeyRound, ClipboardCheck } from 'lucide-react';

interface Metrics {
  businessesIdentified: number;
  businessesWithAccessCodes: number;
  businessesUnclaimed: number;
  businessesClaimed: number;
  businessesPendingReview: number;
  businessesPublished: number;
  businessesStudentVerified: number;
  businessesWithPhotos: number;
  outreachVisitsLogged: number;
  followUpsScheduled: number;
  claimRate: number;
  publishRate: number;
}

export default function AdminOutreachReportsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/reports/outreach')
      .then((r) => r.json())
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
        else setError(data.error || 'Failed to load');
      })
      .catch(() => setError('Failed to load report'));
  }, []);

  const cards = metrics
    ? [
        { label: 'Businesses in pilot', value: metrics.businessesIdentified },
        { label: 'With access codes', value: metrics.businessesWithAccessCodes },
        { label: 'Unclaimed', value: metrics.businessesUnclaimed },
        { label: 'Claimed (draft)', value: metrics.businessesClaimed },
        { label: 'Pending review', value: metrics.businessesPendingReview },
        { label: 'Published', value: metrics.businessesPublished },
        { label: 'Student verified', value: metrics.businessesStudentVerified },
        { label: 'With photos', value: metrics.businessesWithPhotos },
        { label: 'Visits logged', value: metrics.outreachVisitsLogged },
        { label: 'Follow-ups due', value: metrics.followUpsScheduled },
        { label: 'Claim rate', value: `${metrics.claimRate}%` },
        { label: 'Publish rate', value: `${metrics.publishRate}%` },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-7 w-7 text-primary-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate-900">Outreach impact</h1>
      </div>
      <p className="mt-1 text-sm text-slate-600">Victoria BC pilot — live counts from MongoDB.</p>

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      {!metrics && !error ? (
        <p className="mt-8 text-slate-500">Loading metrics…</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/admin/access-codes"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-primary-200"
        >
          <KeyRound className="h-4 w-4 text-primary-600" aria-hidden="true" />
          Manage access codes
        </Link>
        <Link
          href="/admin/outreach"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-primary-200"
        >
          <ClipboardCheck className="h-4 w-4 text-primary-600" aria-hidden="true" />
          Review submissions
        </Link>
      </div>
    </div>
  );
}


