import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/** Full-bleed dark atmosphere for sign-in / sign-up. */
export function AuthCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'relative flex min-h-[calc(100vh-4rem)] w-full overflow-hidden',
        className
      )}
    >
      <div className="absolute inset-0 z-0 bg-auth-canvas" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl motion-safe:animate-auth-glow" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-sky-300/15 blur-3xl motion-safe:animate-auth-glow [animation-delay:1.2s]" />
        <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
      </div>
      <div className="relative z-10 flex w-full flex-1 flex-col">{children}</div>
    </div>
  );
}
