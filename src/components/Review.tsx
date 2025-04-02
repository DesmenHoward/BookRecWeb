import React, { useState } from 'react';
import { Star, Edit, Trash2 } from 'lucide-react';
import { useReviewStore } from '../store/reviewStore';
import { ReviewEditor } from './ReviewEditor';
import { Link } from 'react-router-dom';

interface ReviewProps {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
  currentUserId?: string; // From auth store
}

export const Review: React.FC<ReviewProps> = ({
  id,
  bookId,
  userId,
  userName,
  rating,
  text,
  createdAt,
  updatedAt,
  currentUserId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { deleteReview, isLoading } = useReviewStore();

  const isOwner = currentUserId === userId;
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(updatedAt || createdAt);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReview(id, bookId, userId);
    }
  };

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-gray-50">
        <ReviewEditor
          reviewId={id}
          initialRating={rating}
          initialText={text}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Link 
            to={`/profile/${userId}`} 
            className="font-medium text-gray-900 hover:text-accent transition-colors"
          >
            {userName}
          </Link>
          <div className="text-sm text-gray-500">
            {updatedAt ? `Updated ${formattedDate}` : formattedDate}
          </div>
        </div>
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
              title="Edit review"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600"
              disabled={isLoading}
              title="Delete review"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="mb-2 flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>

      <p className="text-gray-700 whitespace-pre-wrap">{text}</p>
    </div>
  );
};
