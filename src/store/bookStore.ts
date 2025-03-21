import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '../types/book';
import { getInitialBookList, getBookRecommendations, convertGoogleBook } from '../utils/googleBooks';
import { firestore } from '../firebase/config';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useAuthStore } from './authStore';
import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../config/env';

interface BookState {
  books: Book[];
  currentBookIndex: number;
  swipedBooks: { bookId: string; liked: boolean; timestamp: number }[];
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
  loadUserData: () => Promise<void>;
  searchBooks: (query: string) => Promise<Book[]>;
  saveBookToStorage: (book: Book) => Promise<void>;
}

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      books: [],
      currentBookIndex: 0,
      swipedBooks: [],
      favorites: [],
      recommendations: [],
      isLoading: false,
      error: null,
      favoriteGenres: {},
      userNickname: null,

      loadUserData: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            set({
              favorites: data.favorites || [],
              favoriteGenres: data.favoriteGenres || {},
              userNickname: data.nickname || null
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      },

      initializeBooks: async (selectedGenres, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
          const { swipedBooks } = get();
          const books = await getInitialBookList(selectedGenres);
          
          // Filter out books that have been swiped in the last 30 days
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          const recentlySwipedIds = new Set(
            swipedBooks
              .filter(swipe => swipe.timestamp > thirtyDaysAgo)
              .map(swipe => swipe.bookId)
          );

          // Ensure all books have valid cover images and haven't been recently swiped
          const validBooks = books.filter(book => 
            book.coverImages &&
            book.coverImages.large &&
            book.coverImages.medium &&
            book.coverImages.small &&
            !recentlySwipedIds.has(book.id)
          );

          if (validBooks.length < limit) {
            // If we don't have enough valid books, fetch more
            const additionalBooks = await getInitialBookList(selectedGenres);
            const newValidBooks = additionalBooks.filter(book => 
              book.coverImages &&
              book.coverImages.large &&
              book.coverImages.medium &&
              book.coverImages.small &&
              !recentlySwipedIds.has(book.id)
            );
            validBooks.push(...newValidBooks);
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
        const { books, currentBookIndex, swipedBooks, favoriteGenres } = get();
        const currentBook = books[currentBookIndex];
        
        if (currentBook) {
          // Update swipedBooks with timestamp
          const newSwipedBooks = [
            ...swipedBooks, 
            { 
              bookId: currentBook.id, 
              liked, 
              timestamp: Date.now() 
            }
          ];

          // Update genre weights if liked
          const newFavoriteGenres = { ...favoriteGenres };
          if (liked && currentBook.genres) {
            currentBook.genres.forEach(genre => {
              newFavoriteGenres[genre] = (newFavoriteGenres[genre] || 0) + 1;
            });
          }

          set({
            currentBookIndex: currentBookIndex + 1,
            swipedBooks: newSwipedBooks,
            favoriteGenres: newFavoriteGenres
          });

          if (liked) {
            get().addToFavorites(currentBook);
          }

          // Generate recommendations after every 3 swipes
          if (newSwipedBooks.length % 3 === 0) {
            get().generateRecommendations(5);
          }
        }
      },

      generateRecommendations: async (limit = 5) => {
        const { swipedBooks, books } = get();
        if (!swipedBooks.length) return;

        set({ isLoading: true, error: null });

        try {
          // Get recently liked books (last 30 days)
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          const recentLikedBooks = swipedBooks
            .filter(swipe => swipe.liked && swipe.timestamp > thirtyDaysAgo)
            .map(swipe => books.find(book => book.id === swipe.bookId))
            .filter((book): book is Book => book !== undefined);

          const recommendations = await getBookRecommendations(recentLikedBooks);

          // Filter out books that have been swiped
          const swipedIds = new Set(swipedBooks.map(swipe => swipe.bookId));
          const newRecommendations = recommendations.filter(book => !swipedIds.has(book.id));

          set({ 
            recommendations: newRecommendations.slice(0, limit), 
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
          set(state => ({ favorites: [...state.favorites, book] }));
        } catch (error) {
          console.error('Error adding to favorites:', error);
        }
      },

      removeFromFavorites: async (bookId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, {
            favorites: arrayRemove(bookId)
          });
          set(state => ({ favorites: state.favorites.filter(book => book.id !== bookId) }));
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
      },

      searchBooks: async (query: string): Promise<Book[]> => {
        const response = await axios.get(`${API_BASE_URL}/volumes`, {
          params: {
            q: query,
            key: API_KEY,
            fields: 'items(id,volumeInfo(title,authors,description,imageLinks))',
            maxResults: 10,
          },
        });
        return response.data.items.map(convertGoogleBook).filter((book: Book | null) => book !== null);
      },

      saveBookToStorage: async (book: Book) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, {
            savedBooks: arrayUnion(book)
          });
        } catch (error) {
          console.error('Error saving book to storage:', error);
        }
      },
    }),
    {
      name: 'book-store',
      partialize: (state) => ({
        swipedBooks: state.swipedBooks,
        favoriteGenres: state.favoriteGenres,
      })
    }
  )
);