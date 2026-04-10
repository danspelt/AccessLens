'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { MapPin, Menu, X, Plus, LogOut, LogIn, UserPlus } from 'lucide-react';
import { clsx } from 'clsx';

interface NavUser {
  name: string;
  email: string;
}

interface NavbarClientProps {
  user: NavUser | null;
}

function NavbarMobile({
  user,
  navLinks,
  isActive,
  onLogout,
}: {
  user: NavUser | null;
  navLinks: { href: string; label: string }[];
  isActive: (href: string) => boolean;
  onLogout: () => Promise<void>;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-16 z-30 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200/90 bg-gradient-to-b from-white to-slate-50/95 shadow-sheet md:hidden"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="space-y-1 px-4 py-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'block rounded-md px-3 py-2 text-base font-medium transition-colors',
                  isActive(href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-200 px-4 py-3">
            {user ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Signed in as {user.name}</p>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/signin"
                  className="flex-1 rounded-lg border border-slate-300/90 bg-gradient-to-b from-white to-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 shadow-btn-outline transition-[transform,box-shadow] hover:to-slate-100 active:translate-y-px"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 px-4 py-2 text-center text-sm font-medium text-white shadow-btn-primary ring-1 ring-white/15 transition-[transform,box-shadow] hover:from-primary-500 hover:to-primary-600 active:translate-y-px"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function NavbarClient({ user }: NavbarClientProps) {
  const pathname = usePathname();

  // The dashboard area has its own shell + sidebar navigation.
  // Hide the global navbar on those routes.
  const hideOnDashboardRoutes =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/favorites' ||
    pathname.startsWith('/favorites/') ||
    pathname === '/my-reviews' ||
    pathname.startsWith('/my-reviews/') ||
    pathname === '/activities' ||
    pathname.startsWith('/activities/') ||
    pathname === '/my-places' ||
    pathname.startsWith('/my-places/') ||
    pathname === '/settings' ||
    pathname.startsWith('/settings/');

  if (hideOnDashboardRoutes) {
    return null;
  }

  const navLinks = [
    { href: '/explore', label: 'Explore' },
    ...(user
      ? [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/add-place', label: 'Add Place' },
        ]
      : []),
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  async function handleLogout() {
    await signOut({ callbackUrl: '/' });
  }

  return (
    <nav
      className="sticky top-0 z-40 border-b border-slate-200/90 bg-gradient-to-b from-white via-slate-50/80 to-slate-100/90 shadow-nav-bar backdrop-blur-md backdrop-saturate-150"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-label="AccessLens home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-primary-500 to-primary-700 shadow-btn-primary ring-1 ring-white/25 transition-transform active:translate-y-px">
              <MapPin className="h-4 w-4 text-white drop-shadow-sm" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
              Access<span className="bg-gradient-to-b from-primary-500 to-primary-700 bg-clip-text text-transparent">Lens</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex" role="list">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                role="listitem"
                className={clsx(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-[color,background-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  isActive(href)
                    ? 'bg-gradient-to-b from-primary-50 to-primary-100/90 text-primary-800 shadow-nav-pill-active ring-1 ring-primary-200/60'
                    : 'text-slate-600 shadow-sm shadow-transparent hover:bg-gradient-to-b hover:from-white hover:to-slate-100/90 hover:text-slate-900 hover:shadow-nav-pill-hover hover:ring-1 hover:ring-slate-200/80 active:translate-y-px'
                )}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="text-sm text-slate-600">{user.name}</span>
                <Link
                  href="/add-place"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 px-4 py-2 text-sm font-medium text-white shadow-btn-primary ring-1 ring-white/15 transition-[transform,box-shadow,filter] hover:from-primary-500 hover:to-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:translate-y-px"
                >
                  <Plus className="h-4 w-4 drop-shadow-sm" aria-hidden="true" />
                  Add Place
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300/90 bg-gradient-to-b from-white to-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-btn-outline transition-[transform,box-shadow] hover:to-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 active:translate-y-px"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300/90 bg-gradient-to-b from-white to-slate-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-btn-outline transition-[transform,box-shadow] hover:to-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 active:translate-y-px"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 px-4 py-2 text-sm font-medium text-white shadow-btn-primary ring-1 ring-white/15 transition-[transform,box-shadow] hover:from-primary-500 hover:to-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:translate-y-px"
                >
                  <UserPlus className="h-4 w-4 drop-shadow-sm" aria-hidden="true" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <NavbarMobile
            key={pathname}
            user={user}
            navLinks={navLinks}
            isActive={isActive}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
}
