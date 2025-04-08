import { useState, useEffect } from 'react';
import { useReviewStore } from '@/store/reviewStore';
import ReviewCard from './ReviewCard';
import { BookOpen, Plus } from 'lucide-react';
import BookReviewModal from './BookReviewModal';
import type { Review as ReviewType } from '@/types/review';
import { getBookById } from '@/utils/bookStorage';
import { getBookDetails } from '@/utils/googleBooks';

interface ReviewsListProps {
  onAddReview: () => void;
  showOnlyPublic?: boolean;
}

export default function ReviewsList({ onAddReview, showOnlyPublic = false }: ReviewsListProps) {
  const { reviews, toggleReviewVisibility, deleteReview, updateReview } = useReviewStore();
  const [editReviewModalVisible, setEditReviewModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewType | null>(null);
  const [processedReviews, setProcessedReviews] = useState<ReviewType[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);

  useEffect(() => {
    const processReviews = async () => {
      setIsLoadingBooks(true);
      try {
        // Filter reviews based on showOnlyPublic prop
        const filteredReviews = showOnlyPublic 
          ? reviews.filter(review => review.isPublic)
          : reviews;

        // Process each review to include book details
        const processed = await Promise.all(
          filteredReviews
            .filter(review => review.id)
            .map(async review => {
              // Try to get book from local storage first
              let book = await getBookById(review.bookId);
              
              // If not in storage, fetch from API
              if (!book) {
                book = await getBookDetails(review.bookId);
              }

              return {
                id: review.id!,
                text: review.text,
                rating: review.rating,
                date: review.createdAt.toISOString(),
                userId: review.userId,
                userName: review.userName,
                isPublic: review.isPublic ?? true,
                book: book ? {
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  coverUrl: book.coverUrl,
                  coverImages: book.coverImages,
                  description: book.description,
                  genres: book.genres,
                  publishedYear: book.publishedYear,
                  rating: book.rating,
                  status: book.status,
                  isbn: book.isbn,
                  isbn13: book.isbn13,
                  isbn10: book.isbn10
                } : {
                  id: review.bookId,
                  title: review.bookTitle,
                  author: 'Unknown Author',
                  coverUrl: '',
                  coverImages: {
                    small: '',
                    medium: '',
                    large: ''
                  },
                  description: '',
                  genres: [],
                  publishedYear: 0
                }
              } as ReviewType;
            })
        );

        setProcessedReviews(processed);
      } catch (error) {
        console.error('Error processing reviews:', error);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    processReviews();
  }, [reviews, showOnlyPublic]);

  const handleToggleVisibility = (reviewId: string) => {
    if (reviewId) {
      toggleReviewVisibility(reviewId);
    }
  };

  const handleEditReview = (review: ReviewType) => {
    setSelectedReview(review);
    setEditReviewModalVisible(true);
  };

  const handleUpdateReview = (updatedReview: Partial<ReviewType> & { id: string }) => {
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
        <h2 className="text-2xl font-bold">Reviews</h2>
        <button
          onClick={onAddReview}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Review
        </button>
      </div>

      {isLoadingBooks ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : processedReviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm">Share your thoughts on the books you've read!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {processedReviews.map(review => (
            <div key={review.id} className="relative">
              <ReviewCard
                review={review}
                showActions={!showOnlyPublic}
                onToggleVisibility={() => handleToggleVisibility(review.id)}
                onEdit={() => handleEditReview(review)}
                onDelete={() => handleDeleteReview(review.id)}
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
};