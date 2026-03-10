import { forwardRef, LabelHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={clsx('block text-sm font-medium text-slate-700', className)}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);
Label.displayName = 'Label';
