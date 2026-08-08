'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CheckCircle2, Star } from 'lucide-react';

interface ReviewRow {
  id: string;
  placeName: string;
  authorName: string;
  rating: number;
  comment: string;
  adminVerified: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showVerified, setShowVerified] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = showVerified ? 'verified=true' : 'verified=false';
      const res = await fetch(`/api/admin/reviews?${q}&limit=50`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load');
        return;
      }
      setReviews(data.reviews);
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [showVerified]);

  useEffect(() => {
    load();
  }, [load]);

  async function setVerified(reviewId: string, action: 'verify' | 'unverify') {
    setBusyId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Action failed');
        return;
      }
      setReviews((list) => list.filter((r) => r.id !== reviewId));
    } catch {
      setError('Action failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <Star className="h-7 w-7 text-primary-600" aria-hidden="true" />
        Review verification
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Approve trustworthy reviews so contributors can earn the Verified Reviewer badge.
      </p>

      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          variant={showVerified ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => setShowVerified(false)}
        >
          Unverified
        </Button>
        <Button
          type="button"
          variant={showVerified ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setShowVerified(true)}
        >
          Verified
        </Button>
      </div>

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No reviews in this queue.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{r.placeName}</p>
                  <p className="text-sm text-slate-600">
                    {r.authorName} · {r.rating}/5 · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm text-slate-800">{r.comment}</p>
                </div>
                <div className="flex gap-2">
                  {r.adminVerified ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={busyId === r.id}
                      onClick={() => setVerified(r.id, 'unverify')}
                    >
                      Unverify
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyId === r.id}
                      onClick={() => setVerified(r.id, 'verify')}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" aria-hidden="true" />
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
