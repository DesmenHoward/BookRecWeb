import { useFirebaseStore } from '../store/firebaseStore';
import { Review } from '../types/review';
import { Book } from '../types/book';
import { useFirebaseBookService } from './FirebaseBookService';

// Interface for review data in Firestore
export interface FirestoreReview {
  id?: string;
  userId: string;
  bookId: string;
  rating: number;
  text: string;
  date: string;
  isPublic: boolean;
  containsSpoiler?: boolean;
  spoilerType?: 'general' | 'plot' | 'ending' | 'sensitive';
  spoilerWarning?: string;
}

// Collection name for reviews in Firestore
const REVIEWS_COLLECTION = 'reviews';

// Hook for review operations with Firebase
export function useFirebaseReviewService() {
  const { 
    addDocument, 
    getDocuments, 
    getDocument, 
    updateDocument, 
    deleteDocument,
    queryDocuments,
    user
  } = useFirebaseStore();
  
  const { getBookById } = useFirebaseBookService();

  // Add a new review
  const addReview = async (review: Omit<Review, 'id'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const firestoreReview: FirestoreReview = {
        userId: user.uid,
        bookId: review.bookId,
        rating: review.rating,
        text: review.text,
        date: review.date,
        isPublic: review.isPublic,
        containsSpoiler: review.containsSpoiler,
        spoilerType: review.spoilerType,
        spoilerWarning: review.spoilerWarning
      };
      
      const reviewId = await addDocument(REVIEWS_COLLECTION, firestoreReview);
      return reviewId;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  };

  // Update an existing review
  const updateReview = async (reviewId: string, updates: Partial<Review>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Get the review to check ownership
      const review = await getDocument<FirestoreReview>(REVIEWS_COLLECTION, reviewId);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      if (review.userId !== user.uid) {
        throw new Error('Not authorized to update this review');
      }
      
      // Update the review
      await updateDocument(REVIEWS_COLLECTION, reviewId, updates);
    } catch (error) {
      console.error(`Error updating review ${reviewId}:`, error);
      throw error;
    }
  };

  // Delete a review
  const deleteReview = async (reviewId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Get the review to check ownership
      const review = await getDocument<FirestoreReview>(REVIEWS_COLLECTION, reviewId);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      if (review.userId !== user.uid) {
        throw new Error('Not authorized to delete this review');
      }
      
      // Delete the review
      await deleteDocument(REVIEWS_COLLECTION, reviewId);
    } catch (error) {
      console.error(`Error deleting review ${reviewId}:`, error);
      throw error;
    }
  };

  // Toggle review visibility (public/private)
  const toggleReviewVisibility = async (reviewId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Get the review to check ownership and current visibility
      const review = await getDocument<FirestoreReview>(REVIEWS_COLLECTION, reviewId);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      if (review.userId !== user.uid) {
        throw new Error('Not authorized to update this review');
      }
      
      // Toggle visibility
      await updateDocument(REVIEWS_COLLECTION, reviewId, {
        isPublic: !review.isPublic
      });
    } catch (error) {
      console.error(`Error toggling review visibility for ${reviewId}:`, error);
      throw error;
    }
  };

  // Get all reviews by the current user
  const getUserReviews = async (): Promise<Review[]> => {
    if (!user) return [];
    
    try {
      const firestoreReviews = await queryDocuments<FirestoreReview>(
        REVIEWS_COLLECTION,
        'userId',
        '==',
        user.uid
      );
      
      // Fetch book data for each review
      const reviews: Review[] = [];
      
      for (const review of firestoreReviews) {
        const book = await getBookById(review.bookId);
        
        if (book) {
          reviews.push({
            id: review.id || `review-${Date.now()}`,
            bookId: review.bookId,
            book,
            rating: review.rating,
            text: review.text,
            date: review.date,
            isPublic: review.isPublic,
            containsSpoiler: review.containsSpoiler,
            spoilerType: review.spoilerType,
            spoilerWarning: review.spoilerWarning
          });
        }
      }
      
      return reviews;
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  };

  // Get public reviews for a specific book
  const getBookReviews = async (bookId: string): Promise<Review[]> => {
    try {
      const firestoreReviews = await queryDocuments<FirestoreReview>(
        REVIEWS_COLLECTION,
        'bookId',
        '==',
        bookId
      );
      
      // Filter for public reviews only
      const publicReviews = firestoreReviews.filter(review => review.isPublic);
      
      // Get the book data
      const book = await getBookById(bookId);
      
      if (!book) {
        throw new Error('Book not found');
      }
      
      // Map to Review objects
      return publicReviews.map(review => ({
        id: review.id || `review-${Date.now()}`,
        bookId: review.bookId,
        book,
        rating: review.rating,
        text: review.text,
        date: review.date,
        isPublic: review.isPublic,
        containsSpoiler: review.containsSpoiler,
        spoilerType: review.spoilerType,
        spoilerWarning: review.spoilerWarning
      }));
    } catch (error) {
      console.error(`Error getting reviews for book ${bookId}:`, error);
      throw error;
    }
  };

  return {
    addReview,
    updateReview,
    deleteReview,
    toggleReviewVisibility,
    getUserReviews,
    getBookReviews
  };
}