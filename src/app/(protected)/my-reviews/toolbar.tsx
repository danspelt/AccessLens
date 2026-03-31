'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { AddReviewModal } from '@/components/reviews/AddReviewModal';

export function MyReviewsToolbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Reviews</h1>
          <p className="mt-1 text-sm text-slate-600">All the accessibility experiences you’ve shared.</p>
        </div>
        <Button type="button" size="lg" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add review
        </Button>
      </div>

      <AddReviewModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

