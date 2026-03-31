import { formatDistanceToNow } from 'date-fns';
import { Star, MessageSquare } from 'lucide-react';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  authorName: string;
  photoUrls?: string[];
  videoUrls?: string[];
  createdAt: string;
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
        <MessageSquare className="h-8 w-8 text-slate-300" aria-hidden="true" />
        <p className="text-sm text-slate-500">No reviews yet. Be the first to share your experience.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-4" aria-label="Accessibility reviews">
      {reviews.map((review) => (
        <li
          key={review._id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {review.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{review.authorName}</p>
                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1"
              aria-label={`${review.rating} out of 5 stars`}
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-amber-700">{review.rating}/5</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">{review.comment}</p>
          {(review.photoUrls?.length || review.videoUrls?.length) ? (
            <div className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Review media">
              {review.photoUrls?.map((url, i) => (
                <div key={url} role="listitem" className="h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${i + 1} from ${review.authorName}'s review`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {review.videoUrls?.map((url, i) => (
                <div key={url} role="listitem" className="h-36 w-48 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-black">
                  <video
                    src={url}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                    aria-label={`Video ${i + 1} from ${review.authorName}'s review`}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
