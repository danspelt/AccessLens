import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { SkipLink } from '@/components/layout/SkipLink';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';

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
  title: {
    default: 'AccessLens — Accessibility Intelligence for Cities',
    template: '%s | AccessLens',
  },
  description:
    'Find accessible places in Victoria and Vancouver, BC. Community-driven accessibility reviews, photos, and checklists for libraries, restaurants, parks, theatres, and more.',
  keywords: ['accessibility', 'Victoria BC', 'Vancouver BC', 'wheelchair accessible', 'disability', 'inclusive'],
  applicationName: 'AccessLens',
  openGraph: {
    title: 'AccessLens — Accessibility Intelligence for Cities',
    description: 'Find accessible places in Victoria and Vancouver, BC.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-site font-sans text-slate-900 antialiased">
        <AuthSessionProvider>
          <SkipLink />
          <Navbar />
          <main id="main">{children}</main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
