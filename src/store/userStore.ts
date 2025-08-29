import { create } from 'zustand';
import { firestore } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Book } from '../types/book';
import { useAuthStore } from './authStore';

interface UserPreferences {
  favoriteGenres: string[];
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}

interface UserData {
  likedBooks: Book[];
  dislikedBooks: Book[];
  favorites: Book[];
  readingList: Book[];
  bookStatuses: Record<string, string>;
  preferences: UserPreferences;
}

interface UserState {
  userData: UserData;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeUserData: () => Promise<void>;
  updateLikedBooks: (book: Book, liked: boolean) => Promise<void>;
  updateDislikedBooks: (book: Book, disliked: boolean) => Promise<void>;
  updateFavorites: (book: Book, isFavorite: boolean) => Promise<void>;
  updateReadingList: (book: Book, addToList: boolean) => Promise<void>;
  updateBookStatus: (bookId: string, status: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const initialUserData: UserData = {
  likedBooks: [],
  dislikedBooks: [],
  favorites: [],
  readingList: [],
  bookStatuses: {},
  preferences: {
    favoriteGenres: [],
    theme: 'light',
    notificationsEnabled: true
  }
};

export const useUserStore = create<UserState>((set, get) => ({
  userData: initialUserData,
  isLoading: false,
  error: null,

  initializeUserData: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        set({ userData: userDoc.data() as UserData });
      } else {
        // Create new user document with default data
        await setDoc(userDocRef, initialUserData);
        set({ userData: initialUserData });
      }
    } catch (error: any) {
      set({ error: 'Failed to load user data' });
      console.error('Error loading user data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateLikedBooks: async (book: Book, liked: boolean) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const { userData } = get();
      
      const updatedLikedBooks = liked
        ? [...userData.likedBooks, book]
        : userData.likedBooks.filter(b => b.id !== book.id);

      // If liking a book, remove it from disliked books
      const updatedDislikedBooks = liked
        ? userData.dislikedBooks.filter(b => b.id !== book.id)
        : userData.dislikedBooks;

      await updateDoc(userDocRef, {
        likedBooks: updatedLikedBooks,
        dislikedBooks: updatedDislikedBooks
      });

      set(state => ({
        userData: {
          ...state.userData,
          likedBooks: updatedLikedBooks,
          dislikedBooks: updatedDislikedBooks
        }
      }));
    } catch (error) {
      console.error('Error updating liked books:', error);
      set({ error: 'Failed to update liked books' });
    }
  },

  updateDislikedBooks: async (book: Book, disliked: boolean) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const { userData } = get();
      
      const updatedDislikedBooks = disliked
        ? [...userData.dislikedBooks, book]
        : userData.dislikedBooks.filter(b => b.id !== book.id);

      // If disliking a book, remove it from liked books and favorites
      const updatedLikedBooks = disliked
        ? userData.likedBooks.filter(b => b.id !== book.id)
        : userData.likedBooks;
      
      const updatedFavorites = disliked
        ? userData.favorites.filter(b => b.id !== book.id)
        : userData.favorites;

      await updateDoc(userDocRef, {
        dislikedBooks: updatedDislikedBooks,
        likedBooks: updatedLikedBooks,
        favorites: updatedFavorites
      });

      set(state => ({
        userData: {
          ...state.userData,
          dislikedBooks: updatedDislikedBooks,
          likedBooks: updatedLikedBooks,
          favorites: updatedFavorites
        }
      }));
    } catch (error) {
      console.error('Error updating disliked books:', error);
      set({ error: 'Failed to update disliked books' });
    }
  },

  updateFavorites: async (book: Book, isFavorite: boolean) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const { userData } = get();
      
      const updatedFavorites = isFavorite
        ? [...userData.favorites, book]
        : userData.favorites.filter(b => b.id !== book.id);

      await updateDoc(userDocRef, {
        favorites: updatedFavorites
      });

      set(state => ({
        userData: {
          ...state.userData,
          favorites: updatedFavorites
        }
      }));
    } catch (error) {
      console.error('Error updating favorites:', error);
      set({ error: 'Failed to update favorites' });
    }
  },

  updateReadingList: async (book: Book, addToList: boolean) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const { userData } = get();
      
      const updatedReadingList = addToList
        ? [...userData.readingList, book]
        : userData.readingList.filter(b => b.id !== book.id);

      await updateDoc(userDocRef, {
        readingList: updatedReadingList
      });

      set(state => ({
        userData: {
          ...state.userData,
          readingList: updatedReadingList
        }
      }));
    } catch (error) {
      console.error('Error updating reading list:', error);
      set({ error: 'Failed to update reading list' });
    }
  },

  updateBookStatus: async (bookId: string, status: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const { userData } = get();
      
      const updatedStatuses = {
        ...userData.bookStatuses,
        [bookId]: status
      };

      await updateDoc(userDocRef, {
        bookStatuses: updatedStatuses
      });

      set(state => ({
        userData: {
          ...state.userData,
          bookStatuses: updatedStatuses
        }
      }));
    } catch (error) {
      console.error('Error updating book status:', error);
      set({ error: 'Failed to update book status' });
    }
  },

  updatePreferences: async (preferences: Partial<UserPreferences>) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const { userData } = get();
      
      const updatedPreferences = {
        ...userData.preferences,
        ...preferences
      };

      await updateDoc(userDocRef, {
        preferences: updatedPreferences
      });

      set(state => ({
        userData: {
          ...state.userData,
          preferences: updatedPreferences
        }
      }));
    } catch (error) {
      console.error('Error updating preferences:', error);
      set({ error: 'Failed to update preferences' });
    }
  }
}));
