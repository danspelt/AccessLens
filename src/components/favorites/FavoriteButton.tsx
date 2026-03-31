'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Heart } from 'lucide-react';

export function FavoriteButton({
  placeId,
  initialFavorited,
}: {
  placeId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFavorited(!!data.favorited);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={favorited ? 'secondary' : 'outline'}
      onClick={toggle}
      loading={loading}
    >
      <Heart
        className={favorited ? 'h-4 w-4 fill-red-500 text-red-500' : 'h-4 w-4'}
        aria-hidden="true"
      />
      {favorited ? 'Favorited' : 'Favorite'}
    </Button>
  );
}

