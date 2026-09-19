'use client';

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FollowButton({ placeId, initialFollowing }: { placeId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  async function toggle() {
    setLoading(true);
    try {
      const response = await fetch(following ? `/api/follows?placeId=${encodeURIComponent(placeId)}` : '/api/follows', {
        method: following ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: following ? undefined : JSON.stringify({ placeId }),
      });
      if (response.ok) {
        const next = !following;
        setFollowing(next);
        setAnnouncement(next ? 'You are now following updates for this place.' : 'You stopped following this place.');
      } else setAnnouncement('Follow preference could not be updated.');
    } finally { setLoading(false); }
  }
  return <>
    <Button type="button" variant={following ? 'secondary' : 'outline'} onClick={toggle} loading={loading} aria-pressed={following}>
      {following ? <BellOff className="h-4 w-4" aria-hidden="true" /> : <Bell className="h-4 w-4" aria-hidden="true" />}
      {following ? 'Unfollow updates' : 'Follow updates'}
    </Button>
    <span className="sr-only" aria-live="polite">{announcement}</span>
  </>;
}
