import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { LegalDocument, LegalLink, LegalList, LegalMail, LegalSection } from '@/components/layout/LegalDocument';

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Use',
  description:
    'Terms for using AccessLens, including community accessibility contributions, accounts, and official-source parking data.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Use"
      lastUpdated="September 21, 2026"
      description="These terms cover use of AccessLens, the community accessibility map for public places in British Columbia."
    >
      <LegalSection title="Agreement">
        <p>
          AccessLens is operated by Dan Spelt in British Columbia, Canada. Using the site means
          you accept these terms. If you do not accept them, do not use the site.
        </p>
      </LegalSection>

      <LegalSection title="Accessibility information is not a guarantee">
        <p>
          Place pages combine community checklists, photos, reviews, and, where shown,
          official-source starter data. That information can be incomplete, outdated, or wrong
          for a particular person’s needs. It is not a professional accessibility audit, a
          building-code inspection, or a promise that a place is usable. Confirm conditions
          yourself before you rely on a listing, including signage, dimensions, routes, and
          whether a feature is actually available.
        </p>
        <p>
          Scores and labels are calculated from the checklist stored for that place. They are a
          summary of those answers, not a certification.
        </p>
      </LegalSection>

      <LegalSection title="Your contributions">
        <p>
          When you submit a place, review, photo, or accessibility update, you give AccessLens
          permission to store it, moderate it, and display the parts approved for the public map.
          You keep ownership of what you created. Submit only material you have permission to
          share.
        </p>
        <p>Do not upload:</p>
        <LegalList
          items={[
            'Private documents, identification, payment details, or other personal records',
            'Photos of faces, licence plates, or people who have not agreed to appear',
            'Content that is unlawful, harassing, or knowingly false',
          ]}
        />
        <p>
          Uploaded media is stored at a public URL once it is attached to a public record.
          AccessLens may refuse, hide, or remove contributions that break these terms or that
          create a privacy or safety problem.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          Community reviewer accounts can submit reviews and accessibility issue reports.
          Business accounts are for adding and managing place information and cannot submit that
          community feedback. You are responsible for activity under your account. Keep your
          sign-in details to yourself.
        </p>
        <p>
          Business billing is not active. A business account’s subscription flag stays pending
          until a payment provider is connected. Access codes for a place are a convenience for
          updating that listing. They are not proof of legal ownership.
        </p>
      </LegalSection>

      <LegalSection title="Reports and follows">
        <p>
          Issue reports are private moderation records. Filing a report does not publish a public
          issue page, and it does not notify the place’s owner through this site. Following a
          place stores an in-app notice when public details change. Optional email about that
          change is described in the <LegalLink href="/privacy">Privacy Policy</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Official-source data">
        <p>
          Accessible-parking candidates from the City of Victoria stay attributed to that source
          and are licensed under the{' '}
          <a
            href="https://opendata.victoria.ca/pages/open-data-licence"
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Open Government Licence — City of Victoria
          </a>
          . Those records are candidates. They are separate from community-verified places until
          someone supplies current details and those details are reviewed. The city’s licence and
          attribution stay with the source data.
        </p>
        <p>
          Map tiles and address search use OpenStreetMap and Nominatim under their own terms.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>Use the site lawfully. In particular, do not:</p>
        <LegalList
          items={[
            'Probe, scan, or attempt to disrupt the site, accounts, or databases',
            'Scrape in a way that degrades the service for other people',
            'Submit spam or misleading place, review, or claim information',
            'Use another person’s account, access code, or email without permission',
            'Present AccessLens scores or listings as an official government certification',
          ]}
        />
      </LegalSection>

      <LegalSection title="No warranty">
        <p>
          The site is provided as available. AccessLens aims for useful information and does not
          warrant that listings are complete, current, or error-free, or that the site will be
          uninterrupted.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the extent permitted by law, AccessLens and its operator are not liable for
          indirect, incidental, or consequential loss from use of the site, inability to use it,
          or reliance on place information. Nothing in these terms limits liability that cannot
          be limited under applicable law, including the <em>Business Practices and Consumer
          Protection Act</em> of British Columbia where it applies.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of British Columbia and the federal laws of Canada
          that apply there. Disputes about the site are subject to the courts of British Columbia.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          These terms may be updated. The current version is this page, with its date. Questions:{' '}
          <LegalMail />.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
