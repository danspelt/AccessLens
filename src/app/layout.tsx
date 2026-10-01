import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { SkipLink } from '@/components/layout/SkipLink';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
import { SHARE_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: 'Accessible Places in Victoria & Vancouver, BC | AccessLens',
    template: '%s | AccessLens',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'accessible places Victoria BC',
    'accessible places Vancouver BC',
    'wheelchair accessible places',
    'accessibility map',
    'accessibility reviews',
  ],
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Accessible Places in Victoria & Vancouver, BC | AccessLens',
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_CA',
    type: 'website',
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessible Places in Victoria & Vancouver, BC | AccessLens',
    description: SITE_DESCRIPTION,
    images: [SHARE_IMAGE.url],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-site font-sans text-slate-900 antialiased">
        <AuthSessionProvider>
          <SkipLink />
          <Navbar />
          <main id="main" tabIndex={-1} className="outline-none">{children}</main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
