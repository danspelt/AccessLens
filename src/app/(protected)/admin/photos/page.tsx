'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PHOTO_TYPE_LABELS, type PlacePhotoType } from '@/models/PlacePhoto';
import { CheckCircle2, XCircle, Camera } from 'lucide-react';

interface PhotoRow {
  id: string;
  placeId: string;
  placeName: string;
  url: string;
  photoType: PlacePhotoType;
  status: string;
  uploadedBy: { type: string; name?: string; email?: string };
  createdAt: string;
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/photos?status=pending');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load');
        return;
      }
      setPhotos(data.photos);
    } catch {
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function review(photoId: string, action: 'approve' | 'reject') {
    setBusyId(photoId);
    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Action failed');
        return;
      }
      setPhotos((list) => list.filter((p) => p.id !== photoId));
    } catch {
      setError('Action failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <Camera className="h-7 w-7 text-primary-600" aria-hidden="true" />
        Photo review
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Business-submitted photos await approval before appearing on public listings.
      </p>

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          No photos pending review.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2" role="list">
          {photos.map((p) => (
            <li key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </div>
              <p className="mt-3 font-semibold text-slate-900">{p.placeName}</p>
              <p className="text-xs text-slate-500">
                {PHOTO_TYPE_LABELS[p.photoType]} · {p.uploadedBy.name || 'Business'}
              </p>
              <div className="mt-3 flex gap-2">
                <Button type="button" size="sm" loading={busyId === p.id} onClick={() => review(p.id, 'approve')}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  loading={busyId === p.id}
                  onClick={() => review(p.id, 'reject')}
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
