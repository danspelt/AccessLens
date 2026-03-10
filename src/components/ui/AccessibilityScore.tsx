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
      bg: 'bg-green-100',
      border: 'border-green-200',
      bar: 'bg-green-500',
    },
    yellow: {
      text: 'text-yellow-700',
      bg: 'bg-yellow-100',
      border: 'border-yellow-200',
      bar: 'bg-yellow-500',
    },
    red: {
      text: 'text-red-700',
      bg: 'bg-red-100',
      border: 'border-red-200',
      bar: 'bg-red-500',
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
          'inline-flex items-center gap-2 rounded-lg border',
          colors.bg,
          colors.border,
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
        <div className="w-full rounded-full bg-slate-200 h-2" aria-hidden="true">
          <div
            className={clsx('h-2 rounded-full transition-all', colors.bar)}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}
