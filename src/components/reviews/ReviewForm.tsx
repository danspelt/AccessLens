'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoUploadField } from '@/components/ui/PhotoUploadField';

interface ReviewFormProps {
  placeId: string;
}

export function ReviewForm({ placeId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState('');
  const [comment, setComment] = useState('');
  const [accessibilityNotes, setAccessibilityNotes] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/places/${placeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId,
          rating,
          headline,
          comment,
          accessibilityNotes,
          photoUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit review');
        setIsLoading(false);
        return;
      }

      // Reset form and refresh page
      setComment('');
      setRating(5);
      setHeadline('');
      setAccessibilityNotes('');
      setPhotoUrls([]);
      setIsLoading(false);
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="headline" className="mb-2 block text-sm font-medium text-gray-700">
            Headline
          </label>
          <input
            id="headline"
            type="text"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            maxLength={120}
            placeholder="Example: Strong entrance access, tight washroom turning space"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  rating >= value
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={`Rate ${value} out of 5`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">{rating} out of 5</span>
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comment *
          </label>
          <textarea
            id="comment"
            required
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Share your experience with this place..."
          />
        </div>

        <div>
          <label
            htmlFor="accessibilityNotes"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Accessibility notes
          </label>
          <textarea
            id="accessibilityNotes"
            rows={3}
            value={accessibilityNotes}
            onChange={(event) => setAccessibilityNotes(event.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Call out barriers, construction, staff help, washroom details, or route advice."
          />
        </div>

        <PhotoUploadField
          label="Upload evidence photos"
          description="Upload entrance, ramp, washroom, or sidewalk photos that help other community members understand the space."
          value={photoUrls}
          onChange={setPhotoUrls}
          maxFiles={6}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

