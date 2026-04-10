import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'transition-[transform,box-shadow,background-color,color,filter] duration-150',
          {
            'bg-gradient-to-b from-primary-500 to-primary-700 text-white shadow-btn-primary ring-1 ring-white/15 hover:from-primary-500 hover:to-primary-600 focus-visible:ring-primary-500 active:translate-y-px':
              variant === 'primary',
            'border border-slate-300/90 bg-gradient-to-b from-slate-100 to-slate-200/95 text-slate-800 shadow-btn-secondary hover:to-slate-200 focus-visible:ring-slate-500 active:translate-y-px':
              variant === 'secondary',
            'border border-slate-300/90 bg-gradient-to-b from-white to-slate-50 text-slate-700 shadow-btn-outline hover:to-slate-100 focus-visible:ring-slate-500 active:translate-y-px':
              variant === 'outline',
            'text-slate-600 hover:bg-slate-100 hover:shadow-sm hover:shadow-slate-900/5 focus-visible:ring-slate-500 active:translate-y-px':
              variant === 'ghost',
            'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-btn-danger ring-1 ring-white/15 hover:from-red-500 hover:to-red-600 focus-visible:ring-red-500 active:translate-y-px':
              variant === 'danger',
            'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
            'px-4 py-2 text-sm gap-2': size === 'md',
            'px-6 py-3 text-base gap-2': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
