import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'info' | 'warning';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          {
            'bg-gray-100 text-gray-800': variant === 'default',
            'bg-green-100 text-green-800': variant === 'success',
            'bg-blue-100 text-blue-800': variant === 'info',
            'bg-yellow-100 text-yellow-800': variant === 'warning',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

