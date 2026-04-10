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
          'rounded-xl border border-slate-200/90 bg-gradient-to-b from-white via-white to-slate-50/95 shadow-card ring-1 ring-slate-900/[0.035]',
          hover &&
            'cursor-pointer transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
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
