import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { LegalDocument, LegalLink, LegalList, LegalMail, LegalSection } from '@/components/layout/LegalDocument';

export const metadata: Metadata = buildPageMetadata({
  title: 'Accessibility Statement',
  description:
    'Accessibility target, current measures, and known limits for the AccessLens website. This page is about using the site, not place scores.',
  path: '/accessibility',
});

export default function AccessibilityStatementPage() {
  return (
    <LegalDocument
      title="Accessibility Statement"
      lastUpdated="September 21, 2026"
      description="This statement is about using the AccessLens website. Place scores and checklists describe community reports about real-world places and are a separate kind of information."
    >
      <LegalSection title="Conformance target">
        <p>
          The target for this website is{' '}
          <a
            href="https://www.w3.org/TR/WCAG22/"
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            WCAG 2.2 Level AA
          </a>
          . AccessLens is not making a conformance claim. An independent, page-by-page audit has
          not been completed, and unidentified barriers may remain.
        </p>
      </LegalSection>

      <LegalSection title="Measures in place">
        <LegalList
          items={[
            'A skip link to the main content on every page',
            'Semantic headings and form labels on the public flows that collect place and account information',
            'Visible focus styles on primary links, buttons, and form controls',
            'Reduced motion when the browser asks for it (prefers-reduced-motion), and a signed-in setting that applies the same reduction',
            'Signed-in display settings for text size, line height, content density, high contrast, a dyslexia-friendly font, and light or dark theme',
          ]}
        />
        <p>
          Those display settings are saved on the account and cached in this browser. They are
          available after you sign in, from Settings.
        </p>
      </LegalSection>

      <LegalSection title="Known limitations">
        <LegalList
          items={[
            'Interactive maps use Leaflet and OpenStreetMap tiles. The same places are listed in text, which is the accessible way to browse them. The map itself is not a complete keyboard and screen-reader equivalent of that list.',
            'Community photos use generic alternative text (a photo number and the place name) rather than a description of the entrance, washroom, or other feature in the image.',
            'Some older screens may still have gaps that review has not caught.',
            'OpenStreetMap, Google sign-in, and other services opened from a link follow their own accessibility practices.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Place information is separate">
        <p>
          A place’s score, checklist, and photos are community and official-source information
          about that location. They are not a statement that the place, or this website, conforms
          to WCAG or to a building code. How to read that information is covered in the{' '}
          <LegalLink href="/terms">Terms of Use</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Feedback">
        <p>
          If you hit a barrier on this website, or you need a page in a different format, email{' '}
          <LegalMail />. Include the page address and what you were trying to do. The aim is to
          reply within a few business days and to treat confirmed barriers as bugs.
        </p>
      </LegalSection>

      <LegalSection title="Assessment and context">
        <p>
          This statement is a self-assessment of the measures listed above. AccessLens is not a
          prescribed organization under the <em>Accessible British Columbia Act</em>. The
          commitment on this page is voluntary.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
