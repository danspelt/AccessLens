import { Review } from '@/models/Review';

interface ReviewWithUser extends Review {
  userName: string;
}

interface ReviewListProps {
  reviews: ReviewWithUser[];
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
          <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
          {/* Display photos from GridFS */}
          {review.photoIds && review.photoIds.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {review.photoIds.map((photoId, index) => (
                <img
                  key={index}
                  src={`/api/photos/${photoId}`}
                  alt={`Review photo ${index + 1}`}
                  className="rounded-md w-full h-32 object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}
          {/* Fallback for old photoUrls (backward compatibility) */}
          {(!review.photoIds || review.photoIds.length === 0) && review.photoUrls && review.photoUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {review.photoUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Review photo ${index + 1}`}
                  className="rounded-md w-full h-32 object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

