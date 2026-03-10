'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={clsx(
          'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
          'bg-white appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error
            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-300 hover:border-slate-400',
          'disabled:cursor-not-allowed disabled:bg-slate-100',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
