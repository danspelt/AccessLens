import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { SkipLink } from '@/components/layout/SkipLink';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AccessLens — Accessibility Intelligence for Victoria, BC',
    template: '%s | AccessLens',
  },
  description:
    'Find accessible places in Victoria, BC. Community-driven accessibility reviews, photos, and checklists for libraries, restaurants, parks, theatres, and more.',
  keywords: ['accessibility', 'Victoria BC', 'wheelchair accessible', 'disability', 'inclusive'],
  openGraph: {
    title: 'AccessLens — Accessibility Intelligence for Victoria, BC',
    description: 'Find accessible places in Victoria, BC.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-slate-900">
        <SkipLink />
        <Navbar />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
