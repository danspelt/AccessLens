import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Add a place' };

export default function AddPlaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
