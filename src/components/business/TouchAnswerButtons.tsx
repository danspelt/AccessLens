'use client';

import clsx from 'clsx';

type Option<T extends string> = { value: T; label: string; emoji?: string };

export function TouchAnswerButtons<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Option<T>[];
  value?: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={clsx(
              'min-h-[3.25rem] rounded-2xl border-2 px-4 py-4 text-left text-base font-semibold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              selected
                ? 'border-primary-600 bg-primary-50 text-primary-900 shadow-sm'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            {opt.emoji ? <span className="mr-2">{opt.emoji}</span> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const STANDARD_ANSWERS = [
  { value: 'yes' as const, label: 'Yes', emoji: '✅' },
  { value: 'partial' as const, label: 'Partial / Limited', emoji: '⚠️' },
  { value: 'no' as const, label: 'No', emoji: '❌' },
  { value: 'unsure' as const, label: 'Unsure', emoji: '❓' },
  { value: 'planned' as const, label: 'Planned improvement', emoji: '🔧' },
];
