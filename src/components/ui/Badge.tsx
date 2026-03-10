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
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          {
            'bg-slate-100 text-slate-700': variant === 'default',
            'bg-green-100 text-green-700': variant === 'success',
            'bg-blue-100 text-blue-700': variant === 'info',
            'bg-yellow-100 text-yellow-700': variant === 'warning',
            'bg-red-100 text-red-700': variant === 'error',
            'bg-purple-100 text-purple-700': variant === 'purple',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
