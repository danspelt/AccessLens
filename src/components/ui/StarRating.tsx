'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  label = 'Rating',
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div
      className="flex items-center gap-0.5"
      role={readonly ? 'img' : 'group'}
      aria-label={`${label}: ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(null)}
          disabled={readonly}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          aria-pressed={!readonly ? value === star : undefined}
          className={clsx(
            'transition-colors focus:outline-none',
            readonly ? 'cursor-default' : 'cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 rounded'
          )}
        >
          <Star
            className={clsx(
              sizeMap[size],
              'transition-[filter,transform]',
              display >= star
                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_3px_rgba(180,83,9,0.35)]'
                : 'fill-transparent text-slate-300 drop-shadow-none',
              !readonly && display >= star && 'hover:scale-110',
              !readonly && display < star && 'hover:text-amber-300'
            )}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
