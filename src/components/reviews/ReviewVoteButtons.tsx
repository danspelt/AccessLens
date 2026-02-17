'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ReviewVoteButtons({
  reviewId,
  disabled,
  helpfulCount,
  notHelpfulCount,
}: {
  reviewId: string;
  disabled?: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vote = async (value: 1 | -1) => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || 'Failed to vote');
        setIsLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError('Failed to vote');
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => vote(1)}
          disabled={disabled || isLoading}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-200 disabled:opacity-50"
        >
          Helpful ({helpfulCount})
        </button>
        <button
          type="button"
          onClick={() => vote(-1)}
          disabled={disabled || isLoading}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-200 disabled:opacity-50"
        >
          Not helpful ({notHelpfulCount})
        </button>
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      </div>
    </div>
  );
}
