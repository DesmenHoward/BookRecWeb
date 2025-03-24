import { create } from 'zustand';
import { firestore } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Review {
  id?: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface ReviewState {
  reviews: Review[];
  allUserReviews: Review[];
  isLoading: boolean;
  error: string | null;
  editingReviewId: string | null;
  
  // Actions
  getBookReviews: (bookId: string) => Promise<Review[]>;
  getUserReviews: (userId: string) => Promise<Review[]>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'> & { bookTitle: string }) => Promise<void>;
  updateReview: (reviewId: string, updates: Partial<Pick<Review, 'rating' | 'text'>>) => Promise<void>;
  deleteReview: (reviewId: string, bookId: string, userId: string) => Promise<void>;
  setEditingReviewId: (reviewId: string | null) => void;
  clearError: () => void;
}

export const useReviewStore = create<ReviewState>()((set, get) => ({
  reviews: [],
  allUserReviews: [],
  isLoading: false,
  error: null,
  editingReviewId: null,

  getBookReviews: async (bookId: string) => {
    set({ isLoading: true, error: null });
    try {
      const reviewsRef = collection(firestore, 'reviews');
      const q = query(reviewsRef, where('bookId', '==', bookId));
      const querySnapshot = await getDocs(q);
      
      const reviews = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || undefined
        };
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as Review[];
      
      set({ reviews });
      return reviews;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      set({ error: 'Failed to fetch reviews' });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  getUserReviews: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const reviewsRef = collection(firestore, 'reviews');
      const q = query(reviewsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const reviews = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || undefined
        };
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as Review[];
      
      set({ allUserReviews: reviews });
      return reviews;
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      set({ error: 'Failed to fetch user reviews' });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  addReview: async (review) => {
    set({ isLoading: true, error: null });
    try {
      if (!review.text.trim()) {
        throw new Error('Review text cannot be empty');
      }
      if (review.rating < 1 || review.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const reviewsRef = collection(firestore, 'reviews');
      
      // Optimistically add the review
      const optimisticReview = {
        ...review,
        createdAt: new Date(),
        id: 'temp-' + Date.now()
      };
      set(state => ({ reviews: [optimisticReview, ...state.reviews] }));

      // Create the review with server timestamp
      const docRef = await addDoc(reviewsRef, {
        ...review,
        createdAt: serverTimestamp()
      });

      // Update the optimistic review with the real ID
      set(state => ({
        reviews: state.reviews.map(r => 
          r.id === optimisticReview.id ? { ...r, id: docRef.id } : r
        )
      }));
    } catch (error) {
      console.error('Failed to add review:', error);
      set(state => ({
        error: error instanceof Error ? error.message : 'Failed to add review',
        reviews: state.reviews.filter(r => !r.id?.startsWith('temp-'))
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  updateReview: async (reviewId: string, updates: Partial<Pick<Review, 'rating' | 'text'>>) => {
    set({ isLoading: true, error: null });
    try {
      if (updates.text !== undefined && !updates.text.trim()) {
        throw new Error('Review text cannot be empty');
      }
      if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }

      const reviewRef = doc(firestore, 'reviews', reviewId);
      
      // Optimistically update the review
      set(state => ({
        reviews: state.reviews.map(review =>
          review.id === reviewId
            ? { ...review, ...updates, updatedAt: new Date() }
            : review
        ),
        allUserReviews: state.allUserReviews.map(review =>
          review.id === reviewId
            ? { ...review, ...updates, updatedAt: new Date() }
            : review
        )
      }));

      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update review:', error);
      // Revert optimistic update
      get().getBookReviews(get().reviews[0]?.bookId);
      get().getUserReviews(get().reviews[0]?.userId);
      set({ error: error instanceof Error ? error.message : 'Failed to update review' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteReview: async (reviewId: string, bookId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const reviewRef = doc(firestore, 'reviews', reviewId);
      
      // Optimistically remove the review
      set(state => ({
        reviews: state.reviews.filter(r => r.id !== reviewId),
        allUserReviews: state.allUserReviews.filter(r => r.id !== reviewId)
      }));

      await deleteDoc(reviewRef);
    } catch (error) {
      console.error('Failed to delete review:', error);
      // Revert optimistic delete
      get().getBookReviews(bookId);
      get().getUserReviews(userId);
      set({ error: 'Failed to delete review' });
    } finally {
      set({ isLoading: false });
    }
  },

  setEditingReviewId: (reviewId: string | null) => {
    set({ editingReviewId: reviewId });
  },

  clearError: () => {
    set({ error: null });
  }
}));
