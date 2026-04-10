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
          'block w-full rounded-lg border px-3 py-2 text-sm transition-[border-color,box-shadow]',
          'bg-gradient-to-b from-white to-slate-50 shadow-field ring-1 ring-slate-900/[0.03]',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md',
          error
            ? 'border-red-300 bg-gradient-to-b from-red-50 to-red-100/80 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-300/90 hover:border-slate-400',
          'disabled:cursor-not-allowed disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-500 disabled:shadow-none',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
