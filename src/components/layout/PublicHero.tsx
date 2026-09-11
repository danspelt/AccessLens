import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface PublicHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Compact height for directory / tool pages */
  size?: 'default' | 'compact';
  className?: string;
}

/**
 * Shared public marketing hero — same inviting gradient everywhere.
 * Pair with dark navbar routes in NavbarClient.
 */
export function PublicHero({
  eyebrow = 'AccessLens',
  title,
  description,
  children,
  size = 'default',
  className,
}: PublicHeroProps) {
  return (
    <section
      className={clsx(
        'relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-40 top-0 h-[36rem] w-[36rem] rounded-full bg-white/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className={clsx(
          'relative mx-auto max-w-4xl px-5 text-center sm:px-8',
          size === 'compact' ? 'py-14 sm:py-16' : 'py-20 sm:py-24'
        )}
      >
        {eyebrow ? (
          <p className="font-display text-sm font-semibold tracking-[0.22em] text-primary-200 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={clsx(
            'font-display font-bold tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]',
            size === 'compact' ? 'mt-3 text-3xl sm:text-4xl' : 'mt-5 text-4xl sm:text-5xl lg:text-6xl',
            !eyebrow && 'mt-0'
          )}
        >
          {title}
        </h1>
        {description ? (
          <div className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-primary-50 sm:text-xl">
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
