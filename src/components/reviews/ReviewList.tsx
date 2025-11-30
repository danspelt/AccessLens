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
          {review.photoUrls && review.photoUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {review.photoUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Review photo ${index + 1}`}
                  className="rounded-md"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

