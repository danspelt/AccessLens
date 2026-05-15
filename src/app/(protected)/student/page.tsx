'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { OUTREACH_STATUS_LABELS } from '@/models/Place';
import { MapPin, ClipboardList, Calendar } from 'lucide-react';

type Filter = 'all' | 'unclaimed' | 'needs_follow_up';

interface StudentPlace {
  id: string;
  name: string;
  address: string;
  accessCode: string | null;
  outreachStatus: string;
  isClaimed: boolean;
  lastVisit: {
    visitType: string;
    outcome: string;
    visitDate: string;
    nextFollowUpDate: string | null;
  } | null;
}

export default function StudentOutreachPage() {
  const [filter, setFilter] = useState<Filter>('unclaimed');
  const [places, setPlaces] = useState<StudentPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/places?filter=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load');
        return;
      }
      setPlaces(data.places);
    } catch {
      setError('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <MapPin className="h-7 w-7 text-primary-600" aria-hidden="true" />
        Student outreach
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Visit businesses, leave QR materials, and log follow-ups for the Victoria pilot.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ['unclaimed', 'Unclaimed'],
            ['needs_follow_up', 'Follow-ups due'],
            ['all', 'All businesses'],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={filter === key ? 'primary' : 'outline'}
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
        <Link href="/student/visit-log" className="ml-auto">
          <Button type="button" size="sm" variant="outline">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Log a visit
          </Button>
        </Link>
      </div>

      {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : (
        <ul className="mt-6 space-y-3" role="list">
          {places.map((p) => (
            <li key={p.id}>
              <Link
                href={`/student/businesses/${p.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-primary-200 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <p className="text-sm text-slate-500">{p.address}</p>
                  </div>
                  <Badge variant={p.isClaimed ? 'success' : 'default'}>
                    {OUTREACH_STATUS_LABELS[p.outreachStatus as keyof typeof OUTREACH_STATUS_LABELS] ??
                      p.outreachStatus}
                  </Badge>
                </div>
                {p.accessCode ? (
                  <p className="mt-2 font-mono text-sm text-primary-700">Code: {p.accessCode}</p>
                ) : null}
                {p.lastVisit?.nextFollowUpDate ? (
                  <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    Follow-up: {new Date(p.lastVisit.nextFollowUpDate).toLocaleDateString()}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

