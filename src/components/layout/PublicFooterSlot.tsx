'use client';

import { usePathname } from 'next/navigation';

/** Hide the shared public footer on auth canvases (full-bleed dark screens). */
export function PublicFooterSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hide =
    pathname === '/signin' ||
    pathname.startsWith('/signin/') ||
    pathname === '/signup' ||
    pathname.startsWith('/signup/');

  if (hide) return null;
  return <>{children}</>;
}
