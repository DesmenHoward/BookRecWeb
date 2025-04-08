import { useState, useEffect } from 'react';
import { useReviewStore } from '../store/reviewStore';
import ReviewCard from './ReviewCard';
import { BookOpen, Plus } from 'lucide-react';
import BookReviewModal from './BookReviewModal';
import type { Review } from '../types/review';
import { getBookDetails } from '../utils/googleBooks';
import type { Book } from '../types/book';

interface ReviewsListProps {
  reviews: Review[];
  onAddReview: () => void;
  canEdit?: boolean;
  showOnlyPublic?: boolean;
}

export default function ReviewsList({ reviews, onAddReview, canEdit = false, showOnlyPublic = false }: ReviewsListProps) {
  const { toggleReviewVisibility, deleteReview, updateReview } = useReviewStore();
  const [editReviewModalVisible, setEditReviewModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [processedReviews, setProcessedReviews] = useState<Review[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoadingBooks(true);
      try {
        const processedReviews = await Promise.all(
          reviews.map(async (review) => {
            if (!review.book || !review.book.id) {
              const bookDetails = await getBookDetails('') as Book;
              return {
                ...review,
                book: bookDetails
              } as Review;
            }
            return review;
          })
        );
        setProcessedReviews(processedReviews);
      } catch (error) {
        console.error('Error loading book details:', error);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    loadBooks();
  }, [reviews]);

  const handleToggleVisibility = async (reviewId: string) => {
    await toggleReviewVisibility(reviewId);
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setEditReviewModalVisible(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await deleteReview(reviewId);
    }
  };

  const handleUpdateReview = async (updatedReview: Review) => {
    await updateReview(updatedReview.id, {
      rating: updatedReview.rating,
      text: updatedReview.text,
      isPublic: updatedReview.isPublic
    });
    setEditReviewModalVisible(false);
    setSelectedReview(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Review Button */}
      {canEdit && (
        <button
          onClick={onAddReview}
          className="flex items-center justify-center w-full p-4 bg-white rounded-lg border-2 border-dashed border-accent hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-6 h-6 text-accent mr-2" />
          <span className="text-accent font-medium">Add Review</span>
        </button>
      )}

      {/* Reviews List */}
      {isLoadingBooks ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-textLight mt-4">Loading reviews...</p>
        </div>
      ) : processedReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-textLight text-center">
            {canEdit
              ? "You haven't written any reviews yet"
              : "No reviews available"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {processedReviews.map((review) => (
            <div key={review.id} className="relative">
              <ReviewCard
                review={review}
                showActions={!showOnlyPublic && canEdit}
                onToggleVisibility={() => handleToggleVisibility(review.id)}
                onEdit={() => handleEditReview(review)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {selectedReview && (
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