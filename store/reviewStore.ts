import { create } from 'zustand';
import { Review } from '../types/review';
import { firestore } from '../firebase/config';
import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { useAuthStore } from './authStore';

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadReviews: () => Promise<void>;
  addReview: (review: Omit<Review, 'id'>) => Promise<void>;
  updateReview: (reviewId: string, updates: Partial<Review>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  toggleReviewVisibility: (reviewId: string) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  isLoading: false,
  error: null,
  
  loadReviews: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true, error: null });

    try {
      const reviewsRef = collection(firestore, 'reviews');
      const q = query(
        reviewsRef,
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      set({ reviews, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addReview: async (reviewData) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true, error: null });

    try {
      const reviewsRef = collection(firestore, 'reviews');
      const newReview = {
        ...reviewData,
        userId: user.uid,
        date: new Date().toISOString()
      };

      const docRef = await addDoc(reviewsRef, newReview);
      const review = { ...newReview, id: docRef.id };

      set(state => ({
        reviews: [review, ...state.reviews],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  updateReview: async (reviewId, updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true, error: null });

    try {
      const reviewRef = doc(firestore, 'reviews', reviewId);
      await updateDoc(reviewRef, updates);

      set(state => ({
        reviews: state.reviews.map(review => 
          review.id === reviewId ? { ...review, ...updates } : review
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  deleteReview: async (reviewId) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true, error: null });

    try {
      const reviewRef = doc(firestore, 'reviews', reviewId);
      await deleteDoc(reviewRef);

      set(state => ({
        reviews: state.reviews.filter(review => review.id !== reviewId),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  toggleReviewVisibility: async (reviewId) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const review = get().reviews.find(r => r.id === reviewId);
    if (!review) return;

    set({ isLoading: true, error: null });

    try {
      const reviewRef = doc(firestore, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        isPublic: !review.isPublic
      });

      set(state => ({
        reviews: state.reviews.map(r => 
          r.id === reviewId ? { ...r, isPublic: !r.isPublic } : r
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  }
}));