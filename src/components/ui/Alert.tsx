import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const icons: Record<AlertVariant, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

const styles: Record<AlertVariant, string> = {
  info: 'border-blue-200/90 bg-gradient-to-b from-blue-50 to-blue-100/60 text-blue-800 shadow-sm ring-1 ring-blue-900/[0.06]',
  success:
    'border-green-200/90 bg-gradient-to-b from-green-50 to-green-100/60 text-green-800 shadow-sm ring-1 ring-green-900/[0.06]',
  warning:
    'border-yellow-200/90 bg-gradient-to-b from-yellow-50 to-yellow-100/60 text-yellow-800 shadow-sm ring-1 ring-yellow-900/[0.06]',
  error: 'border-red-200/90 bg-gradient-to-b from-red-50 to-red-100/60 text-red-800 shadow-sm ring-1 ring-red-900/[0.06]',
};

const iconStyles: Record<AlertVariant, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, ...props }, ref) => {
    const Icon = icons[variant];
    return (
      <div
        ref={ref}
        role="alert"
        className={clsx('flex gap-3 rounded-lg border p-4', styles[variant], className)}
        {...props}
      >
        <Icon className={clsx('mt-0.5 h-5 w-5 shrink-0', iconStyles[variant])} aria-hidden="true" />
        <div>
          {title && <p className="font-medium">{title}</p>}
          {children && <p className={clsx('text-sm', title && 'mt-1')}>{children}</p>}
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';
