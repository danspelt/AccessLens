'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Heart,
  Star,
  Activity,
  MapPin,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Favorites', href: '/favorites', icon: Heart },
  { label: 'My Reviews', href: '/my-reviews', icon: Star },
  { label: 'My Activity', href: '/activities', icon: Activity },
  { label: 'My Places', href: '/my-places', icon: MapPin },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/dashboard' ? pathname === href : pathname.startsWith(href));

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white via-white to-slate-50/95 p-5 shadow-card ring-1 ring-slate-900/[0.035]">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Signed in as</p>
        <p className="mt-1.5 truncate text-base font-semibold text-slate-900">{userName}</p>
      </div>

      <nav aria-label="Dashboard navigation">
        <ul className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex min-h-[3.25rem] items-center gap-4 rounded-2xl px-5 py-4 text-lg font-semibold leading-snug transition-[color,background-color,box-shadow,transform]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    active
                      ? 'bg-gradient-to-b from-primary-50 to-primary-100/90 text-primary-800 shadow-btn-outline ring-1 ring-primary-200/70'
                      : 'text-slate-600 hover:bg-gradient-to-b hover:from-white hover:to-slate-100/90 hover:text-slate-900 hover:shadow-btn-secondary hover:ring-1 hover:ring-slate-200/80 active:translate-y-px'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="my-5 border-t border-slate-200" />

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className={clsx(
          'flex min-h-[3.25rem] w-full items-center gap-4 rounded-2xl px-5 py-4 text-lg font-semibold leading-snug transition-[color,background-color,box-shadow,transform]',
          'text-slate-600 hover:bg-gradient-to-b hover:from-white hover:to-slate-100/90 hover:text-slate-900 hover:shadow-btn-outline hover:ring-1 hover:ring-slate-200/70 active:translate-y-px',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
        )}
      >
        <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
        Logout
      </button>
    </div>
  );
}

