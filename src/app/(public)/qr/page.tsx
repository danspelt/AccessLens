import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, QrCode, ArrowRight } from 'lucide-react';
import { listQrAnchors } from '@/lib/qr/anchors';
import { PublicPageHeader } from '@/components/layout/PublicPageHeader';

export const metadata: Metadata = {
  title: 'Location codes (QR)',
  description:
    'Scan an AccessLens QR code on location to see nearby accessible places — same data as the full site.',
};

export default function QrHubPage() {
  const anchors = listQrAnchors();

  return (
    <div className="pb-16">
      <PublicPageHeader
        narrow
        eyebrow="QR pilot"
        title={
          <span className="inline-flex items-center gap-3">
            <span className="orb-3d flex h-11 w-11 items-center justify-center rounded-xl text-primary-700">
              <QrCode className="h-6 w-6" aria-hidden="true" />
            </span>
            Location codes
          </span>
        }
        description="QR codes open the same AccessLens map: nearby listings, scores, and photos. Scan a posted code, or open a pilot area below."
      >
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
        >
          Prefer the full map?
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </PublicPageHeader>

      <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Pilot anchors (Victoria, BC)
        </h2>
        <ul className="mt-4 space-y-3" role="list">
          {anchors.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/qr/${a.slug}`}
                className="flex items-start gap-3 rounded-xl panel-surface p-4 transition-all hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">{a.title}</span>
                  {a.subtitle ? (
                    <span className="mt-0.5 block text-sm text-slate-600">{a.subtitle}</span>
                  ) : null}
                  <span className="mt-1 block font-mono text-xs text-slate-400">/qr/{a.slug}</span>
                </span>
                <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
