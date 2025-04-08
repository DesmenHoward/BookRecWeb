import { useState } from 'react';
import { useReviewStore } from '../store/reviewStore';
import ReviewCard from './ReviewCard';
import { BookOpen, Plus } from 'lucide-react';
import BookReviewModal from './BookReviewModal';
import { Review } from '../types/review';

interface ReviewsListProps {
  onAddReview: () => void;
  showOnlyPublic?: boolean;
}

export default function ReviewsList({ onAddReview, showOnlyPublic = false }: ReviewsListProps) {
  const { reviews, toggleReviewVisibility, deleteReview, updateReview } = useReviewStore();
  const [editReviewModalVisible, setEditReviewModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // Filter reviews based on showOnlyPublic prop
  const filteredReviews = showOnlyPublic 
    ? reviews.filter(review => review.isPublic)
    : reviews;
  
  const handleToggleVisibility = (reviewId: string) => {
    if (reviewId) {
      toggleReviewVisibility(reviewId);
    }
  };
  
  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setEditReviewModalVisible(true);
  };
  
  const handleUpdateReview = (updatedReview: Partial<Review> & { id: string }) => {
    updateReview(updatedReview.id, {
      rating: updatedReview.rating,
      text: updatedReview.text,
      isPublic: updatedReview.isPublic
    });
    setEditReviewModalVisible(false);
    setSelectedReview(null);
  };
  
  const handleDeleteReview = (reviewId: string) => {
    if (reviewId && confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      deleteReview(reviewId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
        <button
          onClick={onAddReview}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          <Plus size={16} />
          Add Review
        </button>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <BookOpen size={48} className="mb-4" />
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm">Share your thoughts on the books you've read!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.filter(review => review.id).map(review => (
            <div key={review.id} className="relative">
              <ReviewCard
                review={review}
                showActions={!showOnlyPublic}
                onToggleVisibility={() => review.id && handleToggleVisibility(review.id)}
                onEdit={() => handleEditReview(review)}
                onDelete={() => review.id && handleDeleteReview(review.id)}
              />
            </div>
          ))}
        </div>
      )}

      {editReviewModalVisible && selectedReview && (
        <BookReviewModal
          visible={editReviewModalVisible}
          onClose={() => {
            setEditReviewModalVisible(false);
            setSelectedReview(null);
          }}
          onSubmit={handleUpdateReview}
          initialReview={selectedReview}
        />
      )}
    </div>
  );
}