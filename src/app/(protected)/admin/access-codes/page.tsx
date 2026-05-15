'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { OUTREACH_STATUS_LABELS } from '@/models/Place';
import { KeyRound, Copy, RefreshCw, Download } from 'lucide-react';

interface PlaceRow {
  id: string;
  name: string;
  address: string;
  accessCode: string | null;
  outreachStatus: string;
  isClaimed: boolean;
}

export default function AdminAccessCodesPage() {
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/access-codes?citySlug=victoria-bc');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load');
        return;
      }
      setPlaces(data.places);
    } catch {
      setError('Failed to load places');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generateCode(placeId: string, regenerate = false) {
    setBusyId(placeId);
    try {
      const res = await fetch('/api/admin/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, regenerate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate code');
        return;
      }
      setPlaces((rows) =>
        rows.map((p) => (p.id === placeId ? { ...p, accessCode: data.accessCode } : p))
      );
    } catch {
      setError('Failed to generate code');
    } finally {
      setBusyId(null);
    }
  }

  function copyUpdateLink(code: string) {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/update-accessibility/${code}`
        : `/update-accessibility/${code}`;
    void navigator.clipboard.writeText(url);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="h-7 w-7 text-primary-600" aria-hidden="true" />
            Business access codes
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Generate six-digit codes and QR links for Victoria pilot outreach.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {places.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.address}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-base">
                    {p.accessCode ?? <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.isClaimed ? 'success' : 'default'}>
                      {OUTREACH_STATUS_LABELS[p.outreachStatus as keyof typeof OUTREACH_STATUS_LABELS] ??
                        p.outreachStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        loading={busyId === p.id}
                        onClick={() => generateCode(p.id, Boolean(p.accessCode))}
                      >
                        {p.accessCode ? 'Regenerate' : 'Generate'}
                      </Button>
                      {p.accessCode ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => copyUpdateLink(p.accessCode!)}
                          >
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            Copy link
                          </Button>
                          <a
                            href={`/api/admin/places/${p.id}/qr`}
                            download
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            QR PNG
                          </a>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
