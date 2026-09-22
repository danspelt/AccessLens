import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { LegalDocument, LegalLink, LegalList, LegalMail, LegalSection } from '@/components/layout/LegalDocument';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'How AccessLens collects, uses, and shares personal information for accounts, community contributions, maps, and optional place-update email.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated="September 21, 2026"
      description="How AccessLens handles accounts, community accessibility contributions, official-source starter data, and optional email about places you follow."
    >
      <LegalSection title="Who operates AccessLens">
        <p>
          AccessLens is operated by Dan Spelt in British Columbia, Canada. This policy describes
          the personal information the site collects and why. Questions and privacy requests go to{' '}
          <LegalMail />.
        </p>
      </LegalSection>

      <LegalSection title="Legal framework">
        <p>
          AccessLens handles personal information in line with British Columbia&apos;s{' '}
          <em>Personal Information Protection Act</em> (PIPA). Where personal information crosses
          a provincial or national border, the federal{' '}
          <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA) can also
          apply. Dan Spelt is the person responsible for these practices.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>Creating an account stores:</p>
        <LegalList
          items={[
            'Email address and display name',
            'A hash of your password, when you set one. The password itself is not stored',
            'Name, email, and profile picture returned by Google, if you choose Google sign-in',
            'Role, account type (community reviewer or business), and badges earned from activity on the site',
            'Optional bio and avatar',
            'Display preferences: theme, text size, contrast, motion, line height, density, units, and whether maps load automatically',
            'A profile-visibility preference, stored for a future public profile. Published reviews still show the account display name',
            'Whether optional place-update email is turned on. It starts off',
          ]}
        />
        <p>
          Email sign-in, when configured, sends a one-time link through Resend. That message is
          for signing in. It is not a newsletter.
        </p>
      </LegalSection>

      <LegalSection title="What may be public">
        <p>
          Approved place details, accessibility notes, reviews, display names, ratings, and
          attached media may appear publicly. Uploaded media uses a public URL. Do not upload
          private documents, faces without permission, licence plates, or other personal
          information.
        </p>
        <p>
          Database identifiers for contributors are not included in public review responses.
          Follows, favorites, and in-app notifications stay on the signed-in account. There is no
          public list of who follows a place.
        </p>
      </LegalSection>

      <LegalSection title="What is used for administration">
        <p>
          Account details and place-submission contact information are used to operate accounts,
          review submissions, prevent abuse, and follow up about contributed records.
        </p>
        <LegalList
          items={[
            'Place submissions store the submitter’s name, email, and role, plus optional business phone, email, and website',
            'Business claim requests store the requester’s name and email, and any business email or proof file they provide',
            'Accessibility update requests store the signed-in person’s name and email with the proposed change',
            'Issue reports (broken elevator, blocked ramp, and similar) are private moderation records. They are not published as a public issue page',
            'Student outreach logs can include a business contact name and visit notes for program administration',
            'A verified business access code is kept in an encrypted cookie for 24 hours so that place’s update flow can stay signed in',
          ]}
        />
      </LegalSection>

      <LegalSection title="Followed places and email">
        <p>
          Following a place is separate from saving it as a favorite. When public details of a
          followed place change, AccessLens stores an in-app notification for each follower except
          the person who made the change. Routine timestamps and private moderation fields do not
          create a notification.
        </p>
        <p>
          Email about that change is sent only when Email notifications is turned on in settings.
          The message names the place and says its public accessibility information changed. It
          does not list which fields changed. If delivery fails, the failure is recorded on the
          notification and the in-app notice stays. AccessLens does not run a marketing list.
        </p>
      </LegalSection>

      <LegalSection title="Moderation and corrections">
        <p>
          New place submissions are queued for administrative review. Community reviews can appear
          before an administrator marks them verified. Use the report action on a place record to
          flag inaccurate, unsafe, or privacy-sensitive content.
        </p>
      </LegalSection>

      <LegalSection title="Official-source candidates">
        <p>
          Official-source candidates retain their provider, dataset, licence, record identifier,
          and import date. They remain separate from published place records until current
          community details are supplied and reviewed. City of Victoria accessible-parking
          candidates are starter data under that city’s open-data licence. They are not a
          guarantee that a space is available or accessible today.
        </p>
      </LegalSection>

      <LegalSection title="Maps, addresses, and technical data">
        <p>
          Explore and place maps load map tiles in your browser from OpenStreetMap. Your browser
          sends that request directly, so OpenStreetMap can see the IP address and browser
          information that come with it.
        </p>
        <p>
          Address lookup is done on the AccessLens server through Nominatim
          (nominatim.openstreetmap.org). The address or coordinates in the request are sent
          there, and successful results are cached in the AccessLens database so the same query
          is not repeated. A short-lived rate limit keeps the client IP address in server memory
          only. Those entries are not written to the database and are dropped when the server
          process restarts.
        </p>
        <p>
          Hosting logs may include ordinary request data such as IP address, browser information,
          and timestamps. AccessLens does not run advertising analytics. Site fonts are
          self-hosted and are not loaded from Google at visit time.
        </p>
      </LegalSection>

      <LegalSection title="Service providers">
        <p>These services process limited information so the product can run:</p>
        <LegalList
          items={[
            'MongoDB stores accounts, contributions, follows, notifications, and cached geocode results',
            'Resend delivers magic-link sign-in email and optional place-update email. The recipient address and message content are processed by Resend, which may handle them outside Canada',
            'Google, only if you choose Google sign-in, authenticates you and returns the profile fields described above',
            'OpenStreetMap and Nominatim provide map tiles and address lookup',
          ]}
        />
        <p>
          Cookies and on-device storage are described in the <LegalLink href="/cookies">Cookie Policy</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          Account, contribution, follow, and notification records remain in the database while
          the account or the related place record exists. AccessLens does not run an automatic
          deletion schedule. Geocode cache entries are kept so repeated address lookups can be
          avoided. You can ask for personal information to be deleted; some records may be kept
          when they are needed for moderation, security, or a legal obligation.
        </p>
      </LegalSection>

      <LegalSection title="Your requests">
        <p>
          Email <LegalMail /> to ask for access to, correction of, or deletion of your personal
          information, or to turn off future email. There is no self-serve account deletion
          screen. If a concern is not resolved, you can contact the Office of the Information and
          Privacy Commissioner for British Columbia, or the Office of the Privacy Commissioner of
          Canada for a PIPEDA matter.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          When this policy changes, the updated version is posted on this page with a new date.
          Accessibility information on the map can change and should not be treated as a guarantee
          that a place will meet every person’s needs. How the site may be used is in the{' '}
          <LegalLink href="/terms">Terms of Use</LegalLink>.
        </p>
        <p>
          <Link
            href="/explore"
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Return to Explore
          </Link>
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
