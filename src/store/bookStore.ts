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
  loadOtherUserData: (userId: string) => Promise<void>;
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
          
          // Clear previous state when loading new user data
          set({ topThree: [], favorites: [], favoriteGenres: {}, userNickname: null });
          
          // Load data from Firestore if user is logged in
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
                localStorage.setItem(`userTopThree_${user.uid}`, JSON.stringify(data.topThree));
              }
              
              // Set other user data
              set({
                favorites: data.favorites || [],
                favoriteGenres: data.favoriteGenres || {},
                userNickname: data.nickname || null
              });
              
              // Update localStorage with favorites
              localStorage.setItem(`userFavorites_${user.uid}`, JSON.stringify(data.favorites || []));
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          set({ error: 'Failed to load user data' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadOtherUserData: async (userId: string) => {
        try {
          set({ isLoading: true });
          
          // Clear previous state when loading other user's data
          set({ topThree: [], favorites: [], favoriteGenres: {}, userNickname: null });
          
          const userDocRef = doc(firestore, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('Loaded other user data from Firestore:', data);
            
            // Only set the data we want to show from other users
            set({
              topThree: data.topThree || [],
              userNickname: data.nickname || null
            });
          }
        } catch (error) {
          console.error('Error loading other user data:', error);
          set({ error: 'Failed to load user data' });
        } finally {
          set({ isLoading: false });
        }
      },

      initializeBooks: async (selectedGenres = []) => {
        const { books } = get();
        if (books.length > 0) return;

        try {
          set({ isLoading: true, error: null });
          let newBooks: Book[] = [];

          // First, try to get books from local storage
          const storedBooks = JSON.parse(localStorage.getItem('allStoredBooks') || '[]');
          const storedByGenre = JSON.parse(localStorage.getItem('storedBooksByGenre') || '{}');
          
          // Get stored books for selected genres
          const storedForGenres = selectedGenres.flatMap(genre => storedByGenre[genre] || []);
          
          // Filter out duplicates and ensure we have enough books
          const uniqueStored = Array.from(new Set([...storedForGenres, ...storedBooks]))
            .filter((book: Book) => selectedGenres.length === 0 || 
              book.genres?.some(genre => selectedGenres.includes(genre)));

          // If we have enough stored books, use them
          if (uniqueStored.length >= 10) {
            newBooks = uniqueStored.slice(0, 20); // Get 20 books to start
          } else {
            // If we don't have enough stored books, fetch from API
            const apiBooks = await getInitialBookList(selectedGenres);
            
            // Save new books to storage
            for (const book of apiBooks) {
              await get().saveBookToStorage(book);
            }
            
            // Combine stored and API books, removing duplicates
            const allBooks = [...uniqueStored, ...apiBooks];
            const uniqueBooks = Array.from(
              new Map(allBooks.map(book => [book.id, book])).values()
            );
            newBooks = uniqueBooks.slice(0, 20);
          }

          set({ books: newBooks, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadMoreBooks: async () => {
        const { books, selectedGenres } = get();
        
        try {
          set({ isLoading: true, error: null });
          let newBooks: Book[] = [];

          // Get all stored books
          const storedBooks = JSON.parse(localStorage.getItem('allStoredBooks') || '[]');
          const storedByGenre = JSON.parse(localStorage.getItem('storedBooksByGenre') || '{}');
          
          // Get stored books for selected genres
          const storedForGenres = selectedGenres.flatMap(genre => storedByGenre[genre] || []);
          
          // Combine and filter out duplicates and already shown books
          const existingIds = new Set(books.map(book => book.id));
          const uniqueStored = Array.from(new Set([...storedForGenres, ...storedBooks]))
            .filter((book: Book) => 
              !existingIds.has(book.id) && 
              (selectedGenres.length === 0 || book.genres?.some(genre => selectedGenres.includes(genre)))
            );

          // If we have enough unused stored books, use them
          if (uniqueStored.length >= 10) {
            newBooks = uniqueStored.slice(0, 10);
          } else {
            // If we don't have enough stored books, fetch from API
            const apiBooks = await getInitialBookList(selectedGenres);
            
            // Save new books to storage
            for (const book of apiBooks) {
              await get().saveBookToStorage(book);
            }
            
            // Filter out books we've already shown
            const uniqueApiBooks = apiBooks.filter(book => !existingIds.has(book.id));
            
            // Combine with any remaining stored books
            newBooks = [...uniqueStored, ...uniqueApiBooks].slice(0, 10);
          }

          set({ 
            books: [...books, ...newBooks], 
            isLoading: false 
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
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
        
        try {
          set({ isLoading: true, error: null });
          
          // Get the actual book objects for swiped books
          const swipedBookObjects = swipedBooks
            .filter(swipe => swipe.liked)
            .map(swipe => books.find(book => book.id === swipe.bookId))
            .filter((book): book is Book => book !== undefined);
          
          const recommendations = await getBookRecommendations(swipedBookObjects);
          
          // Save recommended books to storage
          for (const book of recommendations) {
            await get().saveBookToStorage(book);
          }
          
          set({ recommendations: recommendations.slice(0, limit), isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
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
          localStorage.setItem(`userFavorites_${user.uid}`, JSON.stringify(updatedFavorites));
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
          localStorage.setItem(`userFavorites_${user.uid}`, JSON.stringify(updatedFavorites));
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
        
        if (!user) {
          throw new Error('Must be logged in to update top three books');
        }
        
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

          // Persist to localStorage with user-specific key
          try {
            localStorage.setItem(`userTopThree_${user.uid}`, JSON.stringify(books));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }

          // Sync with Firestore
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, {
            topThree: books
          });
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
        try {
          // First check stored books for matches
          const storedBooks = JSON.parse(localStorage.getItem('allStoredBooks') || '[]');
          const queryLower = query.toLowerCase();
          
          const matchingStored = storedBooks.filter((book: Book) => 
            book.title.toLowerCase().includes(queryLower) ||
            book.author.toLowerCase().includes(queryLower) ||
            book.genres?.some(genre => genre.toLowerCase().includes(queryLower))
          );

          // If we have enough matching stored books, use them
          if (matchingStored.length >= 5) {
            return matchingStored.slice(0, 10);
          }

          // Otherwise, search API
          const response = await axios.get(`${API_BASE_URL}/volumes`, {
            params: {
              q: query,
              key: API_KEY,
              maxResults: 10
            }
          });

          const apiBooks = response.data.items.map(convertGoogleBook);
          
          // Save new books to storage
          for (const book of apiBooks) {
            await get().saveBookToStorage(book);
          }
          
          // Combine results, prioritizing stored matches
          const allResults = [...matchingStored, ...apiBooks];
          const uniqueResults = Array.from(
            new Map(allResults.map(book => [book.id, book])).values()
          );
          
          return uniqueResults.slice(0, 10);
        } catch (error) {
          console.error('Error searching books:', error);
          
          // If API fails, return any matching stored books we have
          try {
            const storedBooks = JSON.parse(localStorage.getItem('allStoredBooks') || '[]');
            const queryLower = query.toLowerCase();
            
            return storedBooks
              .filter((book: Book) => 
                book.title.toLowerCase().includes(queryLower) ||
                book.author.toLowerCase().includes(queryLower) ||
                book.genres?.some(genre => genre.toLowerCase().includes(queryLower))
              )
              .slice(0, 10);
          } catch (storageError) {
            console.error('Error searching stored books:', storageError);
            return [];
          }
        }
      },

      saveBookToStorage: async (book: Book) => {
        const { user } = useAuthStore.getState();
        
        // Save to local storage first
        try {
          const storedBooks = JSON.parse(localStorage.getItem('storedBooksByGenre') || '{}');
          const storedAllBooks = JSON.parse(localStorage.getItem('allStoredBooks') || '[]');
          
          // Save to genre-specific storage
          book.genres?.forEach(genre => {
            if (!storedBooks[genre]) {
              storedBooks[genre] = [];
            }
            // Check if book already exists in this genre
            if (!storedBooks[genre].some((b: Book) => b.id === book.id)) {
              storedBooks[genre].push(book);
            }
          });
          
          // Save to all books storage
          if (!storedAllBooks.some((b: Book) => b.id === book.id)) {
            storedAllBooks.push(book);
          }
          
          localStorage.setItem('storedBooksByGenre', JSON.stringify(storedBooks));
          localStorage.setItem('allStoredBooks', JSON.stringify(storedAllBooks));
        } catch (error) {
          console.error('Error saving book to local storage:', error);
        }

        // Then save to Firestore if user is logged in
        if (user) {
          try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
              savedBooks: arrayUnion(book)
            });
          } catch (error) {
            console.error('Error saving book to Firestore:', error);
          }
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