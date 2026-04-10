import { clsx } from 'clsx';
import { Check, X, HelpCircle } from 'lucide-react';

interface ChecklistItemProps {
  label: string;
  value?: boolean;
  description?: string;
}

export function ChecklistItem({ label, value, description }: ChecklistItemProps) {
  const isTrue = value === true;
  const isFalse = value === false;
  const isUnknown = value === undefined || value === null;

  return (
    <div className="flex items-start gap-3 py-2">
      <span
        className={clsx(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-chip-icon ring-1 ring-white/50',
          isTrue && 'bg-gradient-to-b from-green-100 to-green-200/90 text-green-700',
          isFalse && 'bg-gradient-to-b from-red-100 to-red-200/90 text-red-700',
          isUnknown && 'bg-gradient-to-b from-slate-100 to-slate-200/80 text-slate-500'
        )}
        aria-hidden="true"
      >
        {isTrue && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
        {isFalse && <X className="h-3.5 w-3.5" strokeWidth={2.5} />}
        {isUnknown && <HelpCircle className="h-3.5 w-3.5" />}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            'text-sm font-medium',
            isTrue && 'text-slate-900',
            isFalse && 'text-slate-600',
            isUnknown && 'text-slate-500'
          )}
        >
          {label}
        </p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <span
        className={clsx(
          'ml-2 text-xs font-medium',
          isTrue && 'text-green-600',
          isFalse && 'text-red-500',
          isUnknown && 'text-slate-400'
        )}
      >
        {isTrue ? 'Yes' : isFalse ? 'No' : 'Unknown'}
      </span>
    </div>
  );
}
