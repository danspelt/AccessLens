/* eslint-disable @next/next/no-img-element */
import { ReviewWithAuthor } from '@/lib/accesslens/data';

interface ReviewListProps {
  reviews: ReviewWithAuthor[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-500">No reviews yet. Be the first to review this place!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id.toString()}
          className="rounded-lg border border-gray-200 bg-white p-6"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-gray-900">{review.userName}</p>
              <p className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-900 mr-1">
                {review.rating}
              </span>
              <span className="text-yellow-400">★</span>
            </div>
          </div>
          {review.headline ? (
            <h3 className="mb-2 text-base font-semibold text-gray-900">{review.headline}</h3>
          ) : null}
          <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
          {review.accessibilityNotes ? (
            <div className="mt-4 rounded-md bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Accessibility notes
              </p>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                {review.accessibilityNotes}
              </p>
            </div>
          ) : null}
          {review.photoUrls && review.photoUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {review.photoUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Accessibility evidence photo ${index + 1}`}
                  className="h-40 w-full rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

