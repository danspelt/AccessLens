import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface PublicPageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Narrower column for forms and legal copy */
  narrow?: boolean;
}

/**
 * Soft content header for public tool/form pages (no dark hero).
 * Sits on the global `bg-site` canvas.
 */
export function PublicPageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
  narrow = false,
}: PublicPageHeaderProps) {
  return (
    <header
      className={clsx(
        'mx-auto px-4 pt-10 pb-2 sm:px-6 sm:pt-12',
        narrow ? 'max-w-2xl' : 'max-w-3xl',
        className
      )}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1
        className={clsx(
          'font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl',
          eyebrow && 'mt-2'
        )}
      >
        {title}
      </h1>
      {description ? (
        <div className="mt-3 text-lg leading-relaxed text-slate-600">{description}</div>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}
