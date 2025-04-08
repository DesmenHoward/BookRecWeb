import { useState, useEffect } from 'react';
import { 
  Star, 
  X, 
  Check, 
  BookOpen, 
  AlertTriangle 
} from 'lucide-react';
import { Book } from '../types/book';
import { Review } from '../types/review';

interface BookReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (review: Review) => void;
  initialBook?: Book | null;
  initialReview?: Review | null;
}

export default function BookReviewModal({ 
  visible, 
  onClose, 
  onSubmit,
  initialBook = null,
  initialReview = null
}: BookReviewModalProps) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [text, setText] = useState(initialReview?.text || '');
  const [isPublic, setIsPublic] = useState(initialReview?.isPublic ?? true);
  const [containsSpoiler, setContainsSpoiler] = useState(initialReview?.containsSpoiler || false);
  const [spoilerType, setSpoilerType] = useState<'general' | 'plot' | 'ending' | 'sensitive'>(initialReview?.spoilerType || 'general');
  const [spoilerWarning, setSpoilerWarning] = useState(initialReview?.spoilerWarning || 'This review contains spoilers');
  const [book, setBook] = useState<Book | null>(initialBook);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setText(initialReview.text);
      setIsPublic(initialReview.isPublic);
      setContainsSpoiler(initialReview.containsSpoiler || false);
      setSpoilerType(initialReview.spoilerType || 'general');
      setSpoilerWarning(initialReview.spoilerWarning || 'This review contains spoilers');
      setBook(initialReview.book);
    }
  }, [initialReview]);

  if (!visible) return null;

  const handleSubmit = () => {
    if (!book) {
      setError('Please select a book to review');
      return;
    }

    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    if (!text.trim()) {
      setError('Please write a review');
      return;
    }

    const review: Review = {
      id: initialReview?.id || Date.now().toString(),
      book,
      rating,
      text,
      date: initialReview?.date || new Date().toISOString(),
      userId: initialReview?.userId || '',
      userName: initialReview?.userName || '',
      userAvatar: initialReview?.userAvatar,
      isPublic,
      containsSpoiler,
      spoilerType,
      spoilerWarning
    };

    onSubmit(review);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4">
          {initialReview ? 'Edit Review' : 'Write a Review'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {!book && (
          <div className="mb-4 p-4 bg-gray-100 rounded-md flex items-center justify-center">
            <BookOpen size={24} className="text-gray-400 mr-2" />
            <span className="text-gray-600">Select a book to review</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className="text-yellow-400 hover:scale-110 transition-transform"
              >
                <Star
                  size={24}
                  fill={value <= rating ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-2 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Share your thoughts about this book..."
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Make this review public</span>
          </label>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={containsSpoiler}
              onChange={(e) => setContainsSpoiler(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Contains spoilers</span>
          </label>
        </div>

        {containsSpoiler && (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spoiler Type
              </label>
              <select
                value={spoilerType}
                onChange={(e) => setSpoilerType(e.target.value as typeof spoilerType)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="general">General Spoilers</option>
                <option value="plot">Plot Spoilers</option>
                <option value="ending">Ending Spoilers</option>
                <option value="sensitive">Sensitive Content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warning Message
              </label>
              <input
                type="text"
                value={spoilerWarning}
                onChange={(e) => setSpoilerWarning(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter a warning message for readers"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
          >
            <Check size={16} />
            {initialReview ? 'Update Review' : 'Post Review'}
          </button>
        </div>
      </div>
    </div>
  );
}