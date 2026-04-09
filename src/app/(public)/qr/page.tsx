import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, QrCode, ArrowRight } from 'lucide-react';
import { listQrAnchors } from '@/lib/qr/anchors';

export const metadata: Metadata = {
  title: 'Location codes (QR)',
  description:
    'Scan an AccessLens QR code on location to see nearby accessible places — same data as the full site.',
};

export default function QrHubPage() {
  const anchors = listQrAnchors();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
            <QrCode className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Location codes</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            QR codes are a doorway into the same AccessLens platform as the website: nearby listings,
            scores, and photos. Scan a posted code, or open one of the pilot areas below.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Prefer the full map?
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Pilot anchors (Victoria, BC)
        </h2>
        <ul className="mt-4 space-y-3" role="list">
          {anchors.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/qr/${a.slug}`}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">{a.title}</span>
                  {a.subtitle ? (
                    <span className="mt-0.5 block text-sm text-slate-600">{a.subtitle}</span>
                  ) : null}
                  <span className="mt-1 block font-mono text-xs text-slate-400">/qr/{a.slug}</span>
                </span>
                <ArrowRight
                  className="ml-auto h-5 w-5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
