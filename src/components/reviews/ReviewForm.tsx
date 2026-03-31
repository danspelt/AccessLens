'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { MessageSquare } from 'lucide-react';

interface ReviewFormProps {
  placeId: string;
}

export function ReviewForm({ placeId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (comment.length < 10) {
      setError('Comment must be at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/places/${placeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          ...(photoUrls.length ? { photoUrls } : {}),
          ...(videoUrls.length ? { videoUrls } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit review.');
        return;
      }

      setSuccess(true);
      setRating(0);
      setComment('');
      setPhotoUrls([]);
      setVideoUrls([]);
      router.refresh();
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Alert variant="success" title="Review submitted!">
        Thank you for helping the community. Your review has been posted.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Submit accessibility review">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-5 w-5 text-primary-600" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-slate-900">Share your experience</h3>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Label required id="rating-label">Accessibility rating</Label>
        <div className="mt-2">
          <StarRating
            value={rating}
            onChange={setRating}
            size="lg"
            label="Accessibility rating"
          />
          <p className="mt-1 text-xs text-slate-500">
            1 = Very inaccessible · 5 = Fully accessible
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="review-comment" required>
          Your review
        </Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe the accessibility — entrance, washrooms, elevators, parking, obstacles…"
          rows={4}
          className="mt-1.5"
          required
          minLength={10}
          maxLength={2000}
          aria-describedby="comment-hint"
        />
        <p id="comment-hint" className="mt-1 text-xs text-slate-500">
          {comment.length}/2000 characters · Minimum 10 characters
        </p>
      </div>

      <div>
        <Label>Photos &amp; video (optional)</Label>
        <div className="mt-1.5">
          <PhotoUpload
            variant="media"
            onUpload={({ photoUrls: p, videoUrls: v }) => {
              setPhotoUrls(p);
              setVideoUrls(v);
            }}
            context="reviews"
            maxFiles={3}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Images or short clips of entrances, ramps, washrooms, and barriers are most helpful.
        </p>
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full">
        Submit Review
      </Button>
    </form>
  );
}
