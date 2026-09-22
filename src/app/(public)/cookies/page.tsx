import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { LegalDocument, LegalLink, LegalMail, LegalSection } from '@/components/layout/LegalDocument';

export const metadata: Metadata = buildPageMetadata({
  title: 'Cookie Policy',
  description:
    'Essential sign-in cookies and on-device storage used by AccessLens. The site does not set advertising cookies.',
  path: '/cookies',
});

const rows = [
  {
    name: 'authjs.session-token',
    storage: 'Cookie',
    purpose:
      'Keeps you signed in. On HTTPS the name is __Secure-authjs.session-token. The value is an HTTP-only session token.',
    lifetime: 'Up to 30 days, or until you sign out',
  },
  {
    name: 'authjs.csrf-token, authjs.callback-url, authjs.state, authjs.pkce.code_verifier, authjs.nonce',
    storage: 'Cookie',
    purpose:
      'Short-lived Auth.js cookies used only to finish email or Google sign-in. On HTTPS, secure prefixes may be added to the names.',
    lifetime: 'Cleared when sign-in finishes, or within about 15 minutes for the PKCE and state cookies',
  },
  {
    name: 'accesslens_business_access',
    storage: 'Cookie',
    purpose:
      'Encrypted HTTP-only cookie that remembers a verified business access code for one place. SameSite is lax. It is marked Secure in production.',
    lifetime: '24 hours',
  },
  {
    name: 'accesslens:prefs',
    storage: 'localStorage',
    purpose:
      'Caches display preferences on this device, including theme, text size, contrast, motion, and the email-notification choice. Saving while signed in also stores those preferences on the account.',
    lifetime: 'Until you clear site data for this browser',
  },
  {
    name: 'accesslens_signup_intent',
    storage: 'sessionStorage',
    purpose: 'Remembers whether a Google sign-up was started as a reviewer or a business account.',
    lifetime: 'Removed when sign-up completes, or when the tab closes',
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      title="Cookie Policy"
      lastUpdated="September 21, 2026"
      description="AccessLens sets essential cookies so sign-in and business access codes work. It does not set advertising or analytics cookies."
    >
      <LegalSection title="Essential cookies only">
        <p>
          The cookies below are required to keep a session or complete sign-in. AccessLens does
          not use them to build an advertising profile, and it does not load an analytics script.
          Because there is no non-essential cookie to accept or refuse, the site does not show a
          cookie banner.
        </p>
        <p>
          How personal information in those sessions is used is covered in the{' '}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and browser storage">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Cookies and browser storage used by AccessLens</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-900">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Storage
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Purpose
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Lifetime
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-b border-slate-100 align-top last:border-0">
                  <th scope="row" className="px-4 py-3 font-mono text-xs font-medium text-slate-900">
                    {row.name}
                  </th>
                  <td className="px-4 py-3">{row.storage}</td>
                  <td className="px-4 py-3">{row.purpose}</td>
                  <td className="px-4 py-3">{row.lifetime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="Other sites your browser contacts">
        <p>
          Map pages ask your browser to load tiles from OpenStreetMap
          (tile.openstreetmap.org). That request leaves AccessLens, and OpenStreetMap’s own
          practices apply to it. Choosing Google sign-in takes you to Google, which can set its
          own cookies on Google’s domain. Those cookies are not set by AccessLens.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can sign out to end the account session, and you can clear cookies or site data in
          your browser. Blocking the essential cookies will prevent sign-in and the business
          access-code session from sticking. Clearing <span className="font-mono text-xs">accesslens:prefs</span>{' '}
          resets on-device display preferences; a signed-in account can still reload the copy
          stored on the server.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          If AccessLens adds a non-essential cookie, this page will be updated and a choice will
          be added if the law requires one. Questions: <LegalMail />.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
