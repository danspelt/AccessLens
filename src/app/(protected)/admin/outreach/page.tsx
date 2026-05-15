'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { OUTREACH_STATUS_LABELS } from '@/models/Place';
import { VERIFICATION_LABELS } from '@/lib/accessibility/tags';
import { CheckCircle2, XCircle, Shield, ExternalLink } from 'lucide-react';

interface OutreachPlace {
  id: string;
  name: string;
  address: string;
  outreachStatus: string;
  verificationLevel: string | null;
  accessibilityScore: number | null;
  businessContact: { name: string; email: string; role: string } | null;
  publicNotes: string | null;
  photoCount: number;
  lastUpdatedByBusinessAt: string | null;
}

export default function AdminOutreachPage() {
  const [places, setPlaces] = useState<OutreachPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/outreach?status=pending_review');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load');
        return;
      }
      setPlaces(data.places);
    } catch {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(placeId: string, action: 'publish' | 'reject' | 'mark_student_verified') {
    setBusyId(placeId);
    try {
      const res = await fetch(`/api/admin/outreach/${placeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Action failed');
        return;
      }
      setPlaces((list) => list.filter((p) => p.id !== placeId));
    } catch {
      setError('Action failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Business outreach review</h1>
      <p className="mt-1 text-sm text-slate-600">
        Approve business-submitted accessibility updates before they go live.
      </p>

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : places.length === 0 ? (
        <p className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          No submissions awaiting review.
        </p>
      ) : (
        <ul className="mt-6 space-y-4" role="list">
          {places.map((p) => (
            <li key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{p.name}</h2>
                  <p className="text-sm text-slate-500">{p.address}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="warning">
                      {OUTREACH_STATUS_LABELS[p.outreachStatus as keyof typeof OUTREACH_STATUS_LABELS] ??
                        p.outreachStatus}
                    </Badge>
                    {p.verificationLevel ? (
                      <Badge variant="info">
                        {VERIFICATION_LABELS[p.verificationLevel as keyof typeof VERIFICATION_LABELS]}
                      </Badge>
                    ) : null}
                    {p.accessibilityScore != null ? (
                      <Badge variant="default">Score {p.accessibilityScore}</Badge>
                    ) : null}
                  </div>
                </div>
                <Link
                  href={`/places/${p.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
                >
                  Preview
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              {p.businessContact ? (
                <p className="mt-3 text-sm text-slate-600">
                  Contact: {p.businessContact.name} ({p.businessContact.role}) — {p.businessContact.email}
                </p>
              ) : null}
              {p.publicNotes ? (
                <p className="mt-2 text-sm italic text-slate-700">&ldquo;{p.publicNotes}&rdquo;</p>
              ) : null}
              <p className="mt-1 text-xs text-slate-500">{p.photoCount} photo(s)</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  loading={busyId === p.id}
                  onClick={() => runAction(p.id, 'publish')}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Publish
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  loading={busyId === p.id}
                  onClick={() => runAction(p.id, 'mark_student_verified')}
                >
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  Mark student verified
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  loading={busyId === p.id}
                  onClick={() => runAction(p.id, 'reject')}
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Return to draft
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
