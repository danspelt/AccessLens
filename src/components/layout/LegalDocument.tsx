import type { ReactNode } from 'react';
import Link from 'next/link';
import { PublicPageHeader } from '@/components/layout/PublicPageHeader';

const RELATED = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/accessibility', label: 'Accessibility Statement' },
] as const;

const linkClass =
  'font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

export function LegalDocument({
  title,
  description,
  lastUpdated,
  children,
}: {
  title: string;
  description: ReactNode;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="pb-16">
      <PublicPageHeader narrow eyebrow="Legal" title={title} description={description} />
      <article className="mx-auto max-w-2xl px-4 sm:px-6">
        <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
        <div className="mt-8 space-y-10 text-sm leading-relaxed text-slate-700">{children}</div>
        <p className="mt-12 border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-600">
          Related documents:{' '}
          {RELATED.map((item, index) => (
            <span key={item.href}>
              {index > 0 ? ' · ' : null}
              <LegalLink href={item.href}>{item.label}</LegalLink>
            </span>
          ))}
        </p>
      </article>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="font-display text-xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

export function LegalMail() {
  return (
    <a href="mailto:hello@accesslens.ca" className={linkClass}>
      hello@accesslens.ca
    </a>
  );
}
