import React, { useState, useEffect } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface ReviewEditorProps {
  reviewId?: string;
  bookId?: string;
  bookTitle?: string;
  initialRating?: number;
  initialText?: string;
  onCancel?: () => void;
}

export const ReviewEditor: React.FC<ReviewEditorProps> = ({
  reviewId,
  bookId,
  bookTitle,
  initialRating = 5,
  initialText = '',
  onCancel
}) => {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);
  const [error, setError] = useState('');
  
  const { addReview, updateReview, isLoading, error: storeError, clearError } = useReviewStore();

  useEffect(() => {
    if (storeError) {
      setError(storeError);
      clearError();
    }
  }, [storeError, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (reviewId) {
        await updateReview(reviewId, { rating, text });
      } else if (bookId && bookTitle) {
        await addReview({
          bookId,
          bookTitle,
          userId: 'current-user-id', // This should come from your auth store
          userName: 'Current User', // This should come from your auth store
          rating,
          text
        });
      }
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">Rating</label>
        <Rating
          value={rating}
          onChange={(_, newValue) => setRating(newValue || 0)}
          precision={1}
          icon={<StarIcon className="text-yellow-400" />}
          emptyIcon={<StarBorderIcon />}
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="review-text" className="text-sm font-medium text-gray-700">
          Review
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows={4}
          placeholder="Write your review here..."
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : reviewId ? 'Update Review' : 'Post Review'}
        </button>
      </div>
    </form>
  );
};
