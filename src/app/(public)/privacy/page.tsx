import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { PublicPageHeader } from '@/components/layout/PublicPageHeader';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy and Community Data',
  description: 'How AccessLens handles community accessibility contributions and official-source starter data.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="pb-16">
      <PublicPageHeader
        narrow
        eyebrow="Community data"
        title="Privacy and contribution notice"
        description={
          <>
            AccessLens combines community reports with clearly attributed official-source starter data.
            Accessibility information can change and should not be treated as a guarantee that a place will
            meet every person&apos;s needs.
          </>
        }
      />

      <article className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <div className="space-y-8 rounded-2xl panel-surface p-6 sm:p-8">
          <section aria-labelledby="public-content">
            <h2 id="public-content" className="text-xl font-bold text-slate-950">
              What may be public
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">
              Approved place details, accessibility notes, reviews, display names, ratings, and attached
              media may appear publicly. Uploaded media uses a public URL and should never contain private
              documents, faces without permission, licence plates, or other personal information.
            </p>
          </section>
          <section aria-labelledby="private-content">
            <h2 id="private-content" className="text-xl font-bold text-slate-950">
              What is used for administration
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">
              Account details and place-submission contact information are used to operate accounts, review
              submissions, prevent abuse, and follow up about contributed records. Public review responses
              do not include contributor database identifiers.
            </p>
          </section>
          <section aria-labelledby="moderation">
            <h2 id="moderation" className="text-xl font-bold text-slate-950">
              Moderation and corrections
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">
              New place submissions are queued for administrative review. Community reviews can appear
              before an administrator marks them verified. Use the report action on a place record to flag
              inaccurate, unsafe, or privacy-sensitive content.
            </p>
          </section>
          <section aria-labelledby="official-source">
            <h2 id="official-source" className="text-xl font-bold text-slate-950">
              Official-source candidates
            </h2>
            <p className="mt-2 leading-relaxed text-slate-700">
              Official-source candidates retain their provider, dataset, licence, record identifier, and
              import date. They remain separate from published place records until current community details
              are supplied and reviewed.
            </p>
          </section>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-slate-600">
          Questions about your data? Contact{' '}
          <a
            href="mailto:hello@accesslens.ca"
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
          >
            hello@accesslens.ca
          </a>
          .
        </p>

        <Link
          href="/explore"
          className="mt-6 inline-flex min-h-11 items-center font-semibold text-primary-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Return to Explore
        </Link>
      </article>
    </div>
  );
}
