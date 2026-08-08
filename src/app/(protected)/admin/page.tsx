'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  ClipboardCheck,
  FileInput,
  Star,
  AlertTriangle,
  KeyRound,
  BarChart3,
  Shield,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';

type PendingCounts = {
  photos: number;
  placeSubmissions: number;
  outreach: number;
  unverifiedReviews: number;
  reports: number;
};

const queues = [
  {
    key: 'placeSubmissions' as const,
    label: 'Place submissions',
    href: '/admin/place-submissions',
    icon: FileInput,
    description: 'Community and business place proposals awaiting approval.',
  },
  {
    key: 'outreach' as const,
    label: 'Outreach publish queue',
    href: '/admin/outreach',
    icon: ClipboardCheck,
    description: 'Business accessibility updates ready to publish or reject.',
  },
  {
    key: 'photos' as const,
    label: 'Photo review',
    href: '/admin/photos',
    icon: Camera,
    description: 'Business-submitted photos pending public display.',
  },
  {
    key: 'unverifiedReviews' as const,
    label: 'Review verification',
    href: '/admin/reviews',
    icon: Star,
    description: 'Mark trustworthy community reviews for the Verified Reviewer badge.',
  },
  {
    key: 'reports' as const,
    label: 'Open accessibility reports',
    href: '/admin/reports',
    icon: AlertTriangle,
    description: 'Barrier reports filed by the community.',
  },
];

export default function AdminModerationPage() {
  const [pending, setPending] = useState<PendingCounts | null>(null);
  const [actionable, setActionable] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/moderation-summary');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load moderation summary');
        return;
      }
      setPending(data.pending);
      setActionable(data.actionable ?? 0);
    } catch {
      setError('Failed to load moderation summary');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <Shield className="h-7 w-7 text-primary-600" aria-hidden="true" />
        Moderation hub
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Pending queues for places, photos, outreach, and review verification.
        {loading ? null : (
          <>
            {' '}
            <span className="font-medium text-slate-800">{actionable} actionable item{actionable === 1 ? '' : 's'}</span>.
          </>
        )}
      </p>

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      <ul className="mt-8 space-y-3">
        {queues.map((q) => {
          const Icon = q.icon;
          const count = pending?.[q.key] ?? null;
          return (
            <li key={q.href}>
              <Link
                href={q.href}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:bg-primary-50/40"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{q.label}</span>
                    {count !== null ? (
                      <span
                        className={
                          count > 0
                            ? 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900'
                            : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600'
                        }
                      >
                        {count}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">…</span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-600">{q.description}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6 text-sm">
        <Link href="/admin/access-codes" className="inline-flex items-center gap-1.5 text-primary-700 hover:underline">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Access codes
        </Link>
        <Link href="/admin/reports" className="inline-flex items-center gap-1.5 text-primary-700 hover:underline">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Impact report
        </Link>
      </div>
    </div>
  );
}
