import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'info' | 'warning' | 'error' | 'purple';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow-chip-icon ring-1 ring-white/40',
          {
            'bg-gradient-to-b from-slate-100 to-slate-200/90 text-slate-800': variant === 'default',
            'bg-gradient-to-b from-green-100 to-green-200/80 text-green-800': variant === 'success',
            'bg-gradient-to-b from-blue-100 to-blue-200/80 text-blue-800': variant === 'info',
            'bg-gradient-to-b from-yellow-100 to-yellow-200/80 text-yellow-800': variant === 'warning',
            'bg-gradient-to-b from-red-100 to-red-200/80 text-red-800': variant === 'error',
            'bg-gradient-to-b from-purple-100 to-purple-200/80 text-purple-800': variant === 'purple',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
