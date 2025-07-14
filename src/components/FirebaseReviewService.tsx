import { useFirebaseStore } from '../store/firebaseStore';
import { useAuthStore } from '../store/authStore';
import { Review } from '../types/review';
import { useFirebaseBookService } from './FirebaseBookService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/config';

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
    getDocument, 
    setDocument, 
    updateDocument, 
    deleteDocument
  } = useFirebaseStore();
  
  // Get user from auth store
  const { user } = useAuthStore();
  
  // Helper function to add a document with auto-generated ID
  const addDocument = async (collectionName: string, data: any): Promise<string> => {
    const docId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await setDocument(collectionName, docId, data);
    return docId;
  };
  
  // Helper function to query documents
  const queryDocuments = async <T extends Record<string, any>>(collectionName: string, field: string, operator: string, value: any): Promise<T[]> => {
    const collectionRef = collection(firestore, collectionName);
    const q = query(collectionRef, where(field, operator as any, value));
    const querySnapshot = await getDocs(q);
    
    const results: T[] = [];
    querySnapshot.forEach((doc) => {
      // Convert to unknown first to avoid type errors
      results.push({ ...doc.data(), id: doc.id } as unknown as T);
    });
    
    return results;
  };
  
  const { getBookById } = useFirebaseBookService();

  // Add a new review
  const addReview = async (review: Omit<Review, 'id'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Extract bookId from the book object
      const bookId = review.book.id;
      
      const firestoreReview: FirestoreReview = {
        userId: user.uid,
        bookId: bookId,
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
      const review = await getDocument(REVIEWS_COLLECTION, reviewId) as FirestoreReview | null;
      
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
      const review = await getDocument(REVIEWS_COLLECTION, reviewId) as FirestoreReview | null;
      
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
      const review = await getDocument(REVIEWS_COLLECTION, reviewId) as FirestoreReview | null;
      
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
            userId: review.userId,
            userName: review.userId, // Using userId as userName for simplicity
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
      
      // Wait for all the async operations to complete
      return await Promise.all(publicReviews.map(async (review) => {
        // Get user profile to get the username
        let userName = 'Anonymous';
        
        try {
          // This is a simplified implementation - in a real app, you'd query user profiles
          // For now, we'll just use the userId as the userName
          userName = review.userId;
        } catch (error) {
          console.error('Error getting user profile:', error);
        }
        
        // Ensure book is not null before creating the Review object
        if (!book) {
          throw new Error(`Book not found for review ${review.id}`);
        }
        
        return {
          id: review.id || `review-${Date.now()}`,
          userId: review.userId,
          userName: userName,
          book, // This is guaranteed to be non-null now
          rating: review.rating,
          text: review.text,
          date: review.date,
          isPublic: review.isPublic,
          containsSpoiler: review.containsSpoiler,
          spoilerType: review.spoilerType,
          spoilerWarning: review.spoilerWarning
        };
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