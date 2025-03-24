import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '../types/book';
import { getInitialBookList, getBookRecommendations, convertGoogleBook } from '../utils/googleBooks';
import { firestore } from '../firebase/config';
import { doc, updateDoc, arrayUnion, getDoc, arrayRemove } from 'firebase/firestore';
import { useAuthStore } from './authStore';
import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../config/env';

interface BookState {
  books: Book[];
  currentBookIndex: number;
  swipedBooks: { bookId: string; liked: boolean; timestamp: number }[];
  favorites: Book[];
  topThree: Book[];
  recommendations: Book[];
  isLoading: boolean;
  error: string | null;
  favoriteGenres: Record<string, number>;
  userNickname: string | null;
  currentGenreIndex: number;
  selectedGenres: string[];
  
  // Actions
  initializeBooks: (selectedGenres?: string[]) => Promise<void>;
  loadMoreBooks: () => Promise<void>;
  swipeBook: (liked: boolean) => void;
  generateRecommendations: (limit?: number) => Promise<void>;
  addToFavorites: (book: Book) => Promise<void>;
  removeFromFavorites: (bookId: string) => Promise<void>;
  updateTopThree: (books: Book[]) => Promise<void>;
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
      topThree: [],
      recommendations: [],
      isLoading: false,
      error: null,
      favoriteGenres: {},
      userNickname: null,
      currentGenreIndex: 0,
      selectedGenres: [],

      loadUserData: async () => {
        const { user } = useAuthStore.getState();
        console.log('Loading user data...', { user });

        try {
          set({ isLoading: true });
          
          // Always try to load from localStorage first
          const storedFavorites = localStorage.getItem('userFavorites');
          const storedTopThree = localStorage.getItem('userTopThree');
          
          if (storedFavorites) {
            try {
              const parsedFavorites = JSON.parse(storedFavorites);
              console.log('Loaded favorites from localStorage:', parsedFavorites);
              set({ favorites: parsedFavorites });
            } catch (e) {
              console.error('Error parsing stored favorites:', e);
            }
          }

          if (storedTopThree) {
            try {
              const parsedTopThree = JSON.parse(storedTopThree);
              console.log('Loaded top three from localStorage:', parsedTopThree);
              // Validate the data structure
              if (Array.isArray(parsedTopThree) && parsedTopThree.every(book => 
                book && book.id && book.title && book.author && book.coverUrl)) {
                set({ topThree: parsedTopThree });
              }
            } catch (e) {
              console.error('Error parsing stored top three:', e);
            }
          }

          // If user is logged in, sync with Firestore
          if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const data = userDoc.data();
              console.log('Loaded data from Firestore:', data);
              
              // Validate and set the top three from Firestore
              if (Array.isArray(data.topThree) && data.topThree.every(book => 
                book && book.id && book.title && book.author && book.coverUrl)) {
                set({ topThree: data.topThree });
                // Update localStorage with Firestore data
                localStorage.setItem('userTopThree', JSON.stringify(data.topThree));
              }
              
              // Set other user data
              set({
                favorites: data.favorites || [],
                favoriteGenres: data.favoriteGenres || {},
                userNickname: data.nickname || null
              });
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          set({ error: 'Failed to load user data' });
        } finally {
          set({ isLoading: false });
        }
      },

      initializeBooks: async (selectedGenres = []) => {
        set({ isLoading: true, error: null, selectedGenres, currentGenreIndex: 0 });
        try {
          const { swipedBooks } = get();
          
          // Load books from all selected genres
          const booksPromises = selectedGenres.map(genre => getInitialBookList([genre]));
          const booksArrays = await Promise.all(booksPromises);
          const allBooks = booksArrays.flat();
          
          // Filter out books that have been swiped in the last 30 days
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          const recentlySwipedIds = new Set(
            swipedBooks
              .filter(swipe => swipe.timestamp > thirtyDaysAgo)
              .map(swipe => swipe.bookId)
          );

          // Ensure all books have valid cover images and haven't been recently swiped
          const validBooks = allBooks.filter(book => 
            book.coverImages &&
            book.coverImages.large &&
            book.coverImages.medium &&
            book.coverImages.small &&
            !recentlySwipedIds.has(book.id)
          );

          // Shuffle the books to mix genres
          const shuffledBooks = validBooks
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

          set({ books: shuffledBooks, currentBookIndex: 0, isLoading: false });
        } catch (error) {
          console.error('Error initializing books:', error);
          set({ error: 'Failed to load books', isLoading: false });
        }
      },

      loadMoreBooks: async () => {
        const { selectedGenres, currentGenreIndex, books, swipedBooks } = get();
        set({ isLoading: true, error: null });
        
        try {
          // Try next genre if available
          const nextGenreIndex = (currentGenreIndex + 1) % selectedGenres.length;
          const currentGenre = selectedGenres[nextGenreIndex];
          
          const newBooks = await getInitialBookList([currentGenre]);
          
          // Filter out books that have been swiped in the last 30 days
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          const recentlySwipedIds = new Set(
            swipedBooks
              .filter(swipe => swipe.timestamp > thirtyDaysAgo)
              .map(swipe => swipe.bookId)
          );

          // Filter and deduplicate books
          const existingBookIds = new Set(books.map(book => book.id));
          const validNewBooks = newBooks.filter(book => 
            book.coverImages &&
            book.coverImages.large &&
            book.coverImages.medium &&
            book.coverImages.small &&
            !recentlySwipedIds.has(book.id) &&
            !existingBookIds.has(book.id)
          );

          set({ 
            books: [...books, ...validNewBooks],
            currentGenreIndex: nextGenreIndex,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error loading more books:', error);
          set({ error: 'Failed to load more books', isLoading: false });
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
        const { favorites } = get();
        
        // Update local state first
        const updatedFavorites = [...favorites, book];
        console.log('Adding to favorites:', { book, updatedFavorites });
        set({ favorites: updatedFavorites });
        
        // Update localStorage
        try {
          localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
        } catch (e) {
          console.error('Error saving to localStorage:', e);
        }

        // Sync with Firestore if logged in
        if (user) {
          try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
              favorites: arrayUnion(book)
            });
          } catch (error) {
            console.error('Error syncing favorites to Firestore:', error);
          }
        }
      },

      removeFromFavorites: async (bookId: string) => {
        const { user } = useAuthStore.getState();
        const { favorites } = get();
        
        // Update local state
        const updatedFavorites = favorites.filter(book => book.id !== bookId);
        console.log('Removing from favorites:', { bookId, updatedFavorites });
        set({ favorites: updatedFavorites });
        
        // Update localStorage
        try {
          localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
        } catch (e) {
          console.error('Error saving to localStorage:', e);
        }

        // Sync with Firestore if logged in
        if (user) {
          try {
            const userDocRef = doc(firestore, 'users', user.uid);
            const bookToRemove = favorites.find(book => book.id === bookId);
            if (bookToRemove) {
              await updateDoc(userDocRef, {
                favorites: arrayRemove(bookToRemove)
              });
            }
          } catch (error) {
            console.error('Error syncing favorites to Firestore:', error);
          }
        }
      },

      updateTopThree: async (books: Book[]) => {
        const { user } = useAuthStore.getState();
        
        try {
          if (books.length > 3) {
            throw new Error('Cannot set more than 3 top books');
          }

          // Validate books data
          if (!books.every(book => book && book.id && book.title && book.author && book.coverUrl)) {
            throw new Error('Invalid book data structure');
          }

          // Update local state
          set({ topThree: books });

          // Persist to localStorage
          try {
            localStorage.setItem('userTopThree', JSON.stringify(books));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }

          // If user is logged in, sync with Firestore
          if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
              topThree: books
            });
          }
        } catch (error) {
          console.error('Error updating top three:', error);
          set({ error: 'Failed to update top three books' });
        }
      },

      updateBookStatus: async (bookId: string, status: 'read' | 'already-read' | 'not-interested' | null) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          
          // Update recommendations with new status
          set(state => ({
            recommendations: state.recommendations.filter(book => 
              status === 'not-interested' ? book.id !== bookId : true
            ).map(book =>
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
        topThree: state.topThree,
      })
    }
  )
);