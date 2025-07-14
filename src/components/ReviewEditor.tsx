import React, { useState } from 'react';
import { Book } from '../types/book';
import { Review } from '../types/review';

interface ReviewEditorProps {
  book: Book;
  onSubmit: (review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  initialReview?: Review;
  onCancel?: () => void;
}

export const ReviewEditor: React.FC<ReviewEditorProps> = ({
  book,
  onSubmit,
  initialReview,
  onCancel
}) => {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [text, setText] = useState(initialReview?.text || '');
  const [isPublic, setIsPublic] = useState(initialReview?.isPublic ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        book,
        rating,
        text,
        isPublic,
        userId: initialReview?.userId || '',
        userName: initialReview?.userName || '',
        userAvatar: initialReview?.userAvatar
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <div className="flex space-x-2 mt-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`p-2 rounded-full ${
                value <= rating ? 'text-yellow-500' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows={4}
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label className="ml-2 block text-sm text-gray-900">Make review public</label>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Submitting...' : initialReview ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};
