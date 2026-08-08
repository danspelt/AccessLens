import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-2xl border border-white/80 bg-gradient-to-b from-white via-white to-slate-100/90 shadow-card ring-1 ring-slate-900/[0.06]',
          hover &&
            'cursor-pointer transition-[box-shadow,transform] duration-200 motion-safe:hover:-translate-y-1 hover:shadow-card-hover',
          {
            'p-0': padding === 'none',
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';
