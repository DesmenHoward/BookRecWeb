import { create } from 'zustand';
import { firestore } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

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
  isPublic?: boolean;
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
  updateReview: (reviewId: string, updates: Partial<Pick<Review, 'rating' | 'text' | 'isPublic'>>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  setEditingReviewId: (reviewId: string | null) => void;
  clearError: () => void;
  toggleReviewVisibility: (reviewId: string) => Promise<void>;
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
      
      // Fetch all unique user profiles for the reviews
      const userIds = [...new Set(querySnapshot.docs.map(doc => doc.data().userId))];
      const userProfiles = await Promise.all(
        userIds.map(async (userId) => {
          const userDocRef = doc(firestore, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          return { 
            userId, 
            displayName: userDoc.exists() ? userDoc.data()?.displayName || "Anonymous" : "Anonymous" 
          };
        })
      );
      
      const reviews = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Find the matching user profile and use their current display name
        const userProfile = userProfiles.find(profile => profile.userId === data.userId);
        return {
          id: doc.id,
          ...data,
          // Always use the latest display name from the profile
          userName: userProfile?.displayName || "Anonymous",
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
      
      // Get the user's profile to ensure we have the latest display name
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : null;
      const displayName = userData?.displayName || "Anonymous";
      
      const reviews = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Always use the latest display name from the profile
          userName: displayName,
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

  updateReview: async (reviewId: string, updates: Partial<Pick<Review, 'rating' | 'text' | 'isPublic'>>) => {
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
      const firstReview = get().reviews[0];
      if (firstReview) {
        get().getBookReviews(firstReview.bookId);
        get().getUserReviews(firstReview.userId);
      }
      set({ error: error instanceof Error ? error.message : 'Failed to update review' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteReview: async (reviewId: string) => {
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
      const firstReview = get().reviews[0];
      if (firstReview) {
        get().getBookReviews(firstReview.bookId);
        get().getUserReviews(firstReview.userId);
      }
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
  },

  toggleReviewVisibility: async (reviewId: string) => {
    set({ isLoading: true });
    try {
      const reviewRef = doc(firestore, 'reviews', reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }
      
      const currentIsPublic = reviewDoc.data()?.isPublic ?? false;
      
      // Optimistic update
      set((state) => ({
        reviews: state.reviews.map(review =>
          review.id === reviewId
            ? { ...review, isPublic: !review.isPublic }
            : review
        ),
        allUserReviews: state.allUserReviews.map(review =>
          review.id === reviewId
            ? { ...review, isPublic: !review.isPublic }
            : review
        )
      }));

      await updateDoc(reviewRef, {
        isPublic: !currentIsPublic
      });
    } catch (error) {
      console.error('Failed to toggle review visibility:', error);
      // Revert optimistic update
      const firstReview = get().reviews[0];
      if (firstReview) {
        get().getBookReviews(firstReview.bookId);
        get().getUserReviews(firstReview.userId);
      }
      set({ error: error instanceof Error ? error.message : 'Failed to toggle review visibility' });
    } finally {
      set({ isLoading: false });
    }
  }
}));
