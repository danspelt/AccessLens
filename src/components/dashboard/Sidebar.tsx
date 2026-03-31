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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card p-5">
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
                    'flex min-h-[3.25rem] items-center gap-4 rounded-2xl px-5 py-4 text-lg font-semibold leading-snug transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
          'w-full flex min-h-[3.25rem] items-center gap-4 rounded-2xl px-5 py-4 text-lg font-semibold leading-snug transition-colors',
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
        )}
      >
        <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
        Logout
      </button>
    </div>
  );
}

