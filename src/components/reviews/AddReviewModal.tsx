'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Star, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { StarRating } from '@/components/ui/StarRating';
import { PhotoUpload } from '@/components/photos/PhotoUpload';
import { clsx } from 'clsx';

type PlaceSearchResult = {
  _id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  category: string;
  accessibilityScore?: number;
};

export function AddReviewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [selected, setSelected] = useState<PlaceSearchResult | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  const canSubmit = rating > 0 && comment.trim().length >= 10 && !!selected;

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults([]);
    setSelected(null);
    setRating(0);
    setComment('');
    setSubmitting(false);
    setSearching(false);
    setError(null);
    setPhotoUrls([]);
    setVideoUrls([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    setError(null);

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?search=${encodeURIComponent(q)}&limit=8`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || 'Failed to search places.');
          setResults([]);
          return;
        }
        setResults((data?.places || []) as PlaceSearchResult[]);
      } catch (e) {
        if ((e as { name?: string })?.name !== 'AbortError') {
          setError('Failed to search places.');
        }
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [open, query]);

  const title = useMemo(() => {
    return selected ? `Review: ${selected.name}` : 'Add a review';
  }, [selected]);

  async function submit() {
    if (!selected) return;
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/places/${selected._id}/reviews`, {
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
        setError(data?.error || 'Failed to submit review.');
        return;
      }
      onClose();
      router.refresh();
      router.push(`/places/${selected._id}`);
    } catch {
      setError('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:py-10" role="dialog" aria-modal="true" aria-label="Add review">
      <button
        type="button"
        className="fixed inset-0 bg-slate-900/40"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center">
        <div className="relative z-10 w-full max-w-2xl py-4 sm:py-0">
          <Card
            padding="md"
            className="flex max-h-[min(90vh,820px)] flex-col overflow-hidden p-0 shadow-lg"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Choose a place, optionally add photos or video, then rate and describe your visit.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-5">
              {error && (
                <Alert variant="error" className="mb-4">
                  {error}
                </Alert>
              )}

              <div className="space-y-6">
                <div>
                  <Label htmlFor="place-search" required>
                    Find a place
                  </Label>
                  <div className="relative mt-1.5">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="place-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name or address…"
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Type at least 2 characters, then tap a result.</p>

                  <div className="mt-3 rounded-xl border border-slate-200">
                    <div className="max-h-56 overflow-auto sm:max-h-64">
                      {query.trim().length < 2 ? (
                        <div className="p-4 text-sm text-slate-600">Start typing to search.</div>
                      ) : searching ? (
                        <div className="p-4 text-sm text-slate-600">Searching…</div>
                      ) : results.length === 0 ? (
                        <div className="p-4 text-sm text-slate-600">No results.</div>
                      ) : (
                        <ul className="divide-y divide-slate-100" aria-label="Search results">
                          {results.map((p) => {
                            const isSelected = selected?._id === p._id;
                            return (
                              <li key={p._id}>
                                <button
                                  type="button"
                                  onClick={() => setSelected(p)}
                                  className={clsx(
                                    'flex w-full items-start gap-3 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                                    isSelected ? 'bg-primary-50' : 'hover:bg-slate-50'
                                  )}
                                >
                                  <span
                                    className={clsx(
                                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                      isSelected
                                        ? 'border-primary-600 bg-primary-600 text-white'
                                        : 'border-slate-300 bg-white'
                                    )}
                                    aria-hidden="true"
                                  >
                                    {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-3">
                                      <span className="font-semibold text-slate-900">{p.name}</span>
                                      {p.accessibilityScore !== undefined && (
                                        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800">
                                          {p.accessibilityScore}
                                        </span>
                                      )}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-slate-500">
                                      {p.address} · {p.city}, {p.province}
                                    </span>
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>

                  {selected && (
                    <p className="mt-2 text-xs text-slate-600">
                      Reviewing: <span className="font-medium text-slate-800">{selected.name}</span>
                      {' · '}
                      <button
                        type="button"
                        className="font-medium text-primary-600 hover:text-primary-700"
                        onClick={() => setSelected(null)}
                      >
                        Change place
                      </button>
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-2">
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
                    You can add these before or after choosing a place. They attach when you submit.
                  </p>
                </div>

                <div>
                  <Label required>Accessibility rating</Label>
                  <div className="mt-2">
                    <StarRating value={rating} onChange={setRating} size="lg" label="Accessibility rating" />
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
              </div>
            </div>

            <div
              className={clsx(
                'flex shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-6 py-4',
                selected ? 'justify-end' : 'justify-between'
              )}
            >
              {!selected && (
                <p className="max-w-[min(100%,20rem)] text-xs text-slate-600">
                  Select a place from the list, then rate and write your review.
                </p>
              )}
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={submit} loading={submitting} disabled={!canSubmit}>
                  <Star className="h-4 w-4" aria-hidden="true" />
                  Submit review
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
