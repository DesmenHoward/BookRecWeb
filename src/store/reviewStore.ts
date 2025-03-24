import { create } from 'zustand';
import { firestore } from '../firebase/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface Review {
  id?: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: Date;
}

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getBookReviews: (bookId: string) => Promise<Review[]>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'> & { bookTitle: string }) => Promise<void>;
}

export const useReviewStore = create<ReviewState>()((set, get) => ({
  reviews: [],
  isLoading: false,
  error: null,

  getBookReviews: async (bookId: string) => {
    set({ isLoading: true, error: null });
    try {
      const reviewsRef = collection(firestore, 'reviews');
      const q = query(reviewsRef, where('bookId', '==', bookId));
      const querySnapshot = await getDocs(q);
      
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })).sort((a, b) => b.createdAt - a.createdAt) as Review[];
      
      set({ reviews });
      return reviews;
    } catch (error) {
      set({ error: 'Failed to fetch reviews' });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  addReview: async (review) => {
    set({ isLoading: true, error: null });
    try {
      const reviewsRef = collection(firestore, 'reviews');
      await addDoc(reviewsRef, {
        ...review,
        createdAt: new Date()
      });
      
      // Refresh reviews for this book
      await get().getBookReviews(review.bookId);
    } catch (error) {
      set({ error: 'Failed to add review' });
    } finally {
      set({ isLoading: false });
    }
  }
}));
