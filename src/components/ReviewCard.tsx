import { Star, Eye, EyeOff, CreditCard as Edit, Trash2 } from 'lucide-react';
import { Review } from '../types/review';

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  showActions?: boolean;
}

export default function ReviewCard({ 
  review, 
  onEdit, 
  onDelete, 
  onToggleVisibility,
  showActions = false
}: ReviewCardProps) {
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex space-x-4">
            <img
              src={review.book.coverUrl}
              alt={review.book.title}
              className="w-20 h-28 object-cover rounded-lg shadow-sm"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{review.book.title}</h3>
              <p className="text-sm text-gray-600">{review.book.author}</p>
              <div className="mt-2">{renderStars(review.rating)}</div>
              <p className="text-xs text-gray-500 mt-1">{formatDate(review.date)}</p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <button
                onClick={onToggleVisibility}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={review.isPublic ? 'Make Private' : 'Make Public'}
              >
                {review.isPublic ? (
                  <Eye size={20} className="text-gray-600" />
                ) : (
                  <EyeOff size={20} className="text-gray-600" />
                )}
              </button>
              <button
                onClick={onEdit}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Edit Review"
              >
                <Edit size={20} className="text-gray-600" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Delete Review"
              >
                <Trash2 size={20} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-gray-700 whitespace-pre-wrap">{review.text}</p>
        </div>
      </div>
    </div>
  );
}