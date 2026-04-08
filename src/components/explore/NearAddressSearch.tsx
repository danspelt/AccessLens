'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { MapPin } from 'lucide-react';

export function NearAddressSearch() {
  const router = useRouter();
  const sp = useSearchParams();

  const [near, setNear] = useState(sp.get('near') || '');
  const [km, setKm] = useState(sp.get('km') || '5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    const q = near.trim();
    if (q.length < 3) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Could not geocode that address.');
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set('near', q);
      url.searchParams.set('lat', String(data.lat));
      url.searchParams.set('lon', String(data.lon));
      url.searchParams.set('km', km);
      router.push(url.pathname + url.search);
    } catch {
      setError('Could not geocode right now.');
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    const url = new URL(window.location.href);
    ['near', 'lat', 'lon', 'km'].forEach((k) => url.searchParams.delete(k));
    router.push(url.pathname + url.search);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="near">Near address</Label>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            id="near"
            value={near}
            onChange={(e) => setNear(e.target.value)}
            placeholder="e.g. 919 Douglas St, Victoria"
            className="pl-9"
          />
        </div>
        <Input
          value={km}
          onChange={(e) => setKm(e.target.value)}
          inputMode="numeric"
          className="w-20"
          aria-label="Radius in kilometers"
        />
        <Button type="button" onClick={apply} loading={loading}>
          Go
        </Button>
      </div>
      <p className="text-xs text-slate-500">Shows places within {km || 5} km (requires saved coordinates).</p>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}

