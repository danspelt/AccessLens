'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OUTREACH_STATUS_LABELS } from '@/models/Place';

interface PlaceDetail {
  place: {
    _id: string;
    name: string;
    address: string;
    city: string;
    accessCode?: string;
    outreachStatus?: string;
    isClaimed?: boolean;
  };
}

export default function StudentBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [place, setPlace] = useState<PlaceDetail['place'] | null>(null);

  useEffect(() => {
    fetch(`/api/places/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.place) setPlace(data.place);
      })
      .catch(() => {});
  }, [id]);

  if (!place) {
    return <p className="p-8 text-slate-500">Loading…</p>;
  }

  const updateUrl = place.accessCode
    ? `/update-accessibility/${place.accessCode}`
    : '/update-accessibility';

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/student" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All businesses
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{place.name}</h1>
      <p className="text-slate-600">{place.address}</p>
      <div className="mt-3">
        <Badge variant="default">
          {OUTREACH_STATUS_LABELS[(place.outreachStatus as keyof typeof OUTREACH_STATUS_LABELS) ?? 'unclaimed']}
        </Badge>
      </div>

      {place.accessCode ? (
        <div className="mt-6 rounded-xl border border-primary-200 bg-primary-50 p-4">
          <p className="text-sm font-medium text-primary-900">Six-digit access code</p>
          <p className="mt-1 font-mono text-2xl tracking-widest text-primary-800">{place.accessCode}</p>
          <p className="mt-2 text-xs text-primary-700">Leave this on the QR card for the business owner.</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <Link href={updateUrl}>
          <Button type="button" className="w-full">
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Open business update link
          </Button>
        </Link>
        <Link href={`/student/visit-log?placeId=${id}`}>
          <Button type="button" variant="outline" className="w-full">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Log visit for this business
          </Button>
        </Link>
        <Link href={`/places/${id}`} className="text-center text-sm font-medium text-primary-600 hover:underline">
          View public listing
        </Link>
      </div>
    </div>
  );
}
