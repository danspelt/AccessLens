import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, CheckCircle2, CircleParking, ExternalLink, MapPin } from 'lucide-react';
import candidateData from '../../../../../data/victoria-accessible-parking.candidates.json';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Accessible Parking Data in Victoria, BC',
  description:
    'Review accessible-designated parking candidates from the City of Victoria open-data source, with clear provenance and notes for community verification.',
  path: '/official-data/accessible-parking',
});

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export default function AccessibleParkingCandidatesPage() {
  const importedDate = new Date(candidateData.generatedAt).toLocaleDateString('en-CA', { dateStyle: 'long' });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/explore"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-primary-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Explore
        </Link>

        <header className="mt-5 rounded-2xl panel-surface p-5 sm:p-8">
          <p className="eyebrow">Official-source starter data</p>
          <div className="mt-2 flex items-start gap-3">
            <CircleParking className="mt-1 h-8 w-8 shrink-0 text-primary-600" aria-hidden="true" />
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">
                Accessible parking data in Victoria, BC
              </h1>
              <p className="mt-3 max-w-3xl leading-relaxed text-slate-700">
                These five records come from the City of Victoria&apos;s accessible-designated parking data. They are
                starting points for community verification—not published AccessLens place records and not a guarantee
                that signs, dimensions, routes, availability, or parking rules are current.
              </p>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="flex items-center gap-2 font-semibold text-slate-900">
                <CalendarClock className="h-4 w-4" aria-hidden="true" /> Snapshot imported
              </dt>
              <dd className="mt-1 text-slate-700">{importedDate}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="font-semibold text-slate-900">Verification state</dt>
              <dd className="mt-1 text-slate-700">Pending current community details</dd>
            </div>
          </dl>

          <p className="mt-5 text-sm text-slate-700">
            {candidateData.source.attribution}{' '}
            <a
              href={candidateData.source.layerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              View the City source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>{' '}
            <a
              href={candidateData.source.licenceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center font-semibold text-primary-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              Read the licence
            </a>
          </p>
        </header>

        <section aria-labelledby="candidate-list-heading" className="mt-8">
          <h2 id="candidate-list-heading" className="font-display text-xl font-bold text-slate-950">
            Candidates to check
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            If you visit one, note the current sign, access aisle, curb route, surface, nearby barriers, and any rule changes.
          </p>

          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {candidateData.candidates.map((candidate) => {
              const attributes = candidate.officialAttributes as Record<string, unknown>;
              const hours = text(attributes.HoursInEffect);
              const aisle = text(attributes.AccessAisle);
              const dimensions = [attributes.Width_m, attributes.Length_m].every((value) => typeof value === 'number')
                ? `${attributes.Width_m} m wide × ${attributes.Length_m} m long`
                : null;

              return (
                <li key={candidate.provenance.recordId} className="rounded-2xl panel-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pending verification</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-slate-950">{candidate.name}</h3>
                  <p className="mt-2 flex items-start gap-2 text-sm text-slate-700">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {candidate.address ?? `Coordinates ${candidate.latitude.toFixed(5)}, ${candidate.longitude.toFixed(5)}`}
                  </p>
                  <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                    <div><dt className="inline font-semibold text-slate-900">City record: </dt><dd className="inline text-slate-700">{candidate.provenance.recordId}</dd></div>
                    {hours && <div><dt className="inline font-semibold text-slate-900">Recorded hours: </dt><dd className="inline text-slate-700">{hours}</dd></div>}
                    {aisle && <div><dt className="inline font-semibold text-slate-900">Recorded access aisle: </dt><dd className="inline text-slate-700">{aisle}</dd></div>}
                    {dimensions && <div><dt className="inline font-semibold text-slate-900">Recorded dimensions: </dt><dd className="inline text-slate-700">{dimensions}</dd></div>}
                  </dl>
                  <p className="mt-4 text-xs leading-relaxed text-slate-600">{candidate.disclaimer}</p>
                  <Link
                    href="/places/new"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Add current details
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
