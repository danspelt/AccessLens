import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { SkipLink } from '@/components/layout/SkipLink';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AccessLens | Accessibility Intelligence for Cities',
  description:
    'Community-driven accessibility data for libraries, parks, sidewalks, restaurants, theatres, transit stops, hospitals, and public buildings.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipLink />
        <Navbar />
        <main id="main" className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

