import { clsx } from 'clsx';
import { getScoreColor, getScoreLabel } from '@/models/Place';

interface AccessibilityScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showBar?: boolean;
}

export function AccessibilityScore({
  score,
  size = 'md',
  showLabel = true,
  showBar = false,
}: AccessibilityScoreProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const colorMap = {
    green: {
      text: 'text-green-700',
      panel: 'from-green-50 to-green-100/75 border-green-200/90',
      bar: 'bg-gradient-to-b from-green-400 to-green-600 shadow-sm',
    },
    yellow: {
      text: 'text-yellow-700',
      panel: 'from-yellow-50 to-yellow-100/75 border-yellow-200/90',
      bar: 'bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-sm',
    },
    red: {
      text: 'text-red-700',
      panel: 'from-red-50 to-red-100/75 border-red-200/90',
      bar: 'bg-gradient-to-b from-red-400 to-red-600 shadow-sm',
    },
  };

  const sizeMap = {
    sm: { score: 'text-lg font-bold', label: 'text-xs', padding: 'px-2 py-1' },
    md: { score: 'text-2xl font-bold', label: 'text-sm', padding: 'px-3 py-2' },
    lg: { score: 'text-4xl font-bold', label: 'text-base', padding: 'px-4 py-3' },
  };

  const colors = colorMap[color];
  const sizes = sizeMap[size];

  return (
    <div className="flex flex-col gap-1">
      <div
        className={clsx(
          'inline-flex items-center gap-2 rounded-lg border bg-gradient-to-b shadow-sm ring-1 ring-black/[0.04]',
          colors.panel,
          sizes.padding
        )}
        role="img"
        aria-label={`Accessibility score: ${score} out of 100 — ${label}`}
      >
        <span className={clsx(colors.text, sizes.score)}>{score}</span>
        <span className={clsx(colors.text, 'text-xs font-medium opacity-70')}>/100</span>
        {showLabel && (
          <span className={clsx(colors.text, sizes.label, 'font-medium')}>{label}</span>
        )}
      </div>
      {showBar && (
        <div
          className="h-2 w-full rounded-full bg-gradient-to-b from-slate-200 to-slate-300 shadow-inset-well ring-1 ring-slate-900/[0.06]"
          aria-hidden="true"
        >
          <div
            className={clsx('h-2 rounded-full transition-all', colors.bar)}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}
