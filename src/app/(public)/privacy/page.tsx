import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Landmark, ShieldCheck, Users } from 'lucide-react';
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
        <div className="divide-y divide-slate-100 rounded-2xl panel-surface">
          {[
            {
              id: 'public-content',
              icon: Users,
              title: 'What may be public',
              body: 'Approved place details, accessibility notes, reviews, display names, ratings, and attached media may appear publicly. Uploaded media uses a public URL and should never contain private documents, faces without permission, licence plates, or other personal information.',
            },
            {
              id: 'private-content',
              icon: ShieldCheck,
              title: 'What is used for administration',
              body: 'Account details and place-submission contact information are used to operate accounts, review submissions, prevent abuse, and follow up about contributed records. Public review responses do not include contributor database identifiers.',
            },
            {
              id: 'moderation',
              icon: CheckCircle,
              title: 'Moderation and corrections',
              body: 'New place submissions are queued for administrative review. Community reviews can appear before an administrator marks them verified. Use the report action on a place record to flag inaccurate, unsafe, or privacy-sensitive content.',
            },
            {
              id: 'official-source',
              icon: Landmark,
              title: 'Official-source candidates',
              body: 'Official-source candidates retain their provider, dataset, licence, record identifier, and import date. They remain separate from published place records until current community details are supplied and reviewed.',
            },
          ].map(({ id, icon: Icon, title, body }) => (
            <section key={id} aria-labelledby={id} className="flex gap-4 p-6 sm:p-7">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id={id} className="text-lg font-bold text-slate-950">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{body}</p>
              </div>
            </section>
          ))}
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
