'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error
            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-300 bg-white hover:border-slate-400',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
