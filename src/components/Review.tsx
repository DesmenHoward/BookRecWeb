import React, { useState } from 'react';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useReviewStore } from '../store/reviewStore';
import { ReviewEditor } from './ReviewEditor';

interface ReviewProps {
  id: string;
  bookId: string;
  bookTitle: string;
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
  bookTitle,
  userId,
  userName,
  rating,
  text,
  createdAt,
  updatedAt,
  currentUserId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
          <div className="font-medium text-gray-900">{userName}</div>
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
              <EditIcon fontSize="small" />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600"
              disabled={isLoading}
              title="Delete review"
            >
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-2">
        <Rating
          value={rating}
          readOnly
          icon={<StarIcon className="text-yellow-400" />}
          emptyIcon={<StarBorderIcon />}
        />
      </div>

      <div className="text-gray-700 whitespace-pre-wrap">{text}</div>
    </div>
  );
};
