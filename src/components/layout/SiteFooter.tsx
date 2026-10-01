import Link from 'next/link';
import { Facebook, Linkedin, MapPin } from 'lucide-react';
import { getActiveCities } from '@/lib/db/cities';

const SOCIAL_LINKS = [
  { network: 'LinkedIn', href: 'https://www.linkedin.com/company/accesslens-ca/', Icon: Linkedin },
  { network: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61594813536930', Icon: Facebook },
];

export async function SiteFooter() {
  let cities: Awaited<ReturnType<typeof getActiveCities>> = [];
  try {
    cities = await getActiveCities();
  } catch {
    cities = [];
  }

  return (
    <footer className="relative mt-auto border-t border-slate-200/80 bg-gradient-to-b from-white/70 via-slate-50 to-slate-100/95">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 text-white shadow-btn-primary ring-1 ring-white/20">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-lg font-bold text-slate-900">AccessLens</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Community-sourced accessibility information for public places.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Inspired by goals aligned with the Accessible Canada Act and BC Accessibility Act.
            </p>
            <ul className="mt-4 flex items-center gap-2" aria-label="AccessLens on social media">
              {SOCIAL_LINKS.map(({ network, href, Icon }) => (
                <li key={network}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`AccessLens on ${network}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary-500 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Platform</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600" role="list">
              <li>
                <Link href="/explore" className="transition-colors hover:text-primary-600">
                  Explore places
                </Link>
              </li>
              <li>
                <Link href="/for-businesses" className="transition-colors hover:text-primary-600">
                  For businesses
                </Link>
              </li>
              <li>
                <Link href="/pitch" className="transition-colors hover:text-primary-600">
                  For government
                </Link>
              </li>
              <li>
                <Link href="/places/new" className="transition-colors hover:text-primary-600">
                  Add a place
                </Link>
              </li>
              <li>
                <Link href="/qr" className="transition-colors hover:text-primary-600">
                  Location codes (QR)
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Account</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600" role="list">
              <li>
                <Link href="/about" className="transition-colors hover:text-primary-600">
                  About
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-primary-600">
                  Join AccessLens
                </Link>
              </li>
              <li>
                <Link href="/signin" className="transition-colors hover:text-primary-600">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-primary-600">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-primary-600">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="transition-colors hover:text-primary-600">
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="transition-colors hover:text-primary-600">
                  Accessibility
                </Link>
              </li>
              <li>
                <a href="mailto:hello@accesslens.ca" className="transition-colors hover:text-primary-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Cities</h3>
            {cities.length > 0 ? (
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600" role="list">
                {cities.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/cities/${c.slug}`}
                      className="transition-colors hover:text-primary-600"
                    >
                      {c.name}, {c.province}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">More cities coming soon.</p>
            )}
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} AccessLens. Built with care for the accessibility community
            ·{' '}
            <a
              href="https://danspelt.com/?utm_source=accesslens&utm_medium=footer&utm_campaign=product-sites"
              target="_blank"
              rel="noopener"
              className="transition-colors hover:text-primary-600"
            >
              Built by Dan Spelt
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
