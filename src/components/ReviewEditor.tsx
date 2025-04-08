import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useReviewStore } from '@/store/reviewStore';
import { useAuthStore } from '@/store/authStore';

interface ReviewEditorProps {
  reviewId?: string;
  bookId?: string;
  bookTitle?: string;
  initialRating?: number;
  initialText?: string;
  onCancel?: () => void;
}

const RatingStars = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const ReviewEditor = ({
  reviewId,
  bookId,
  bookTitle,
  initialRating = 5,
  initialText = '',
  onCancel
}: ReviewEditorProps) => {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);
  const [error, setError] = useState('');
  
  const { addReview, updateReview, isLoading, error: storeError, clearError } = useReviewStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (storeError) {
      setError(storeError);
      clearError();
    }
  }, [storeError, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to submit a review');
      return;
    }

    try {
      if (reviewId) {
        await updateReview(reviewId, { rating, text });
      } else if (bookId && bookTitle) {
        await addReview({
          bookId,
          bookTitle,
          rating,
          text,
          userId: user.uid,
          userName: user.displayName || 'Anonymous User',
          isPublic: true
        });
      }
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <RatingStars rating={rating} onRatingChange={setRating} />
      </div>

      <div>
        <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-1">
          Review
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Write your review here..."
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : reviewId ? 'Update Review' : 'Post Review'}
        </button>
      </div>
    </form>
  );
};
