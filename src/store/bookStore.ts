import { create } from 'zustand';
import { Book } from '../types/book';
import { getInitialBookList, getBookRecommendations } from '../utils/googleBooks';
import { firestore } from '../firebase/config';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthStore } from './authStore';

interface BookState {
  books: Book[];
  currentBookIndex: number;
  swipedBooks: { bookId: string; liked: boolean }[];
  favorites: Book[];
  recommendations: Book[];
  isLoading: boolean;
  error: string | null;
  favoriteGenres: Record<string, number>;
  userNickname: string | null;
  
  // Actions
  initializeBooks: (selectedGenres?: string[], limit?: number) => Promise<void>;
  swipeBook: (liked: boolean) => void;
  generateRecommendations: (limit?: number) => Promise<void>;
  addToFavorites: (book: Book) => Promise<void>;
  removeFromFavorites: (bookId: string) => Promise<void>;
  updateBookStatus: (bookId: string, status: 'read' | 'already-read' | 'not-interested' | null) => Promise<void>;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  currentBookIndex: 0,
  swipedBooks: [],
  favorites: [],
  recommendations: [],
  isLoading: false,
  error: null,
  favoriteGenres: {},
  userNickname: null,

  initializeBooks: async (selectedGenres, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const books = await getInitialBookList(selectedGenres);
      
      // Ensure all books have valid cover images
      const validBooks = books.filter(book => 
        book.coverImages &&
        book.coverImages.large &&
        book.coverImages.medium &&
        book.coverImages.small
      );

      if (validBooks.length < limit) {
        // If we don't have enough valid books, fetch more
        const additionalBooks = await getInitialBookList(selectedGenres);
        validBooks.push(...additionalBooks.filter(book => 
          book.coverImages &&
          book.coverImages.large &&
          book.coverImages.medium &&
          book.coverImages.small
        ));
      }

      set({ 
        books: validBooks.slice(0, limit),
        currentBookIndex: 0,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: 'Failed to load books. Please try again later.', 
        isLoading: false 
      });
    }
  },

  swipeBook: (liked: boolean) => {
    const { books, currentBookIndex, swipedBooks } = get();
    const currentBook = books[currentBookIndex];
    
    if (currentBook) {
      const newSwipedBooks = [...swipedBooks, { bookId: currentBook.id, liked }];
      set({
        currentBookIndex: currentBookIndex + 1,
        swipedBooks: newSwipedBooks
      });

      if (liked) {
        get().addToFavorites(currentBook);
      }

      if (newSwipedBooks.length === 3) {
        get().generateRecommendations(5);
      }
    }
  },

  generateRecommendations: async (limit = 5) => {
    const { swipedBooks, books } = get();
    
    if (!swipedBooks.length) return;

    set({ isLoading: true, error: null });
    
    try {
      const likedBooks = swipedBooks
        .filter(swipe => swipe.liked)
        .map(swipe => books.find(book => book.id === swipe.bookId))
        .filter((book): book is Book => book !== undefined);

      const recommendations = await getBookRecommendations(likedBooks);
      set({ 
        recommendations: recommendations.slice(0, limit), 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: 'Failed to generate recommendations', 
        isLoading: false 
      });
    }
  },

  addToFavorites: async (book: Book) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        favorites: arrayUnion(book)
      });

      set(state => ({
        favorites: [...state.favorites, book]
      }));
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  },

  removeFromFavorites: async (bookId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const bookToRemove = get().favorites.find(book => book.id === bookId);
      
      if (bookToRemove) {
        await updateDoc(userDocRef, {
          favorites: arrayRemove(bookToRemove)
        });

        set(state => ({
          favorites: state.favorites.filter(book => book.id !== bookId)
        }));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  },

  updateBookStatus: async (bookId: string, status: 'read' | 'already-read' | 'not-interested' | null) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // Update recommendations with new status
      set(state => ({
        recommendations: state.recommendations.map(book =>
          book.id === bookId ? { ...book, status } : book
        )
      }));

      // Store status in user's document
      await updateDoc(userDocRef, {
        [`bookStatuses.${bookId}`]: status
      });

      // If marked as read or already-read, add to favorites
      if (status === 'read' || status === 'already-read') {
        const book = get().recommendations.find(b => b.id === bookId);
        if (book && !get().favorites.some(f => f.id === bookId)) {
          await get().addToFavorites(book);
        }
      }

      // Regenerate recommendations if needed
      if (status === 'not-interested') {
        await get().generateRecommendations(5);
      }
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  }
}));