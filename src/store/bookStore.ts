import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '../types/book';
import { getInitialBookList, getBookRecommendations, searchBooks as searchGoogleBooks } from '../utils/googleBooks';
import { RecommendationEngine, UserProfile, BookInteraction } from '../utils/recommendationEngine';
import { TrendingBooksService } from '../utils/trendingBooks';
import { useUserStore } from './userStore';
import { firestore } from '../firebase/config';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthStore } from './authStore';
import { storeBooks, getAllBooks, storeBook } from '../utils/bookStorage';

interface BookState {
  books: Book[];
  currentBookIndex: number;
  swipedBooks: { bookId: string; liked: boolean; timestamp: number }[];
  favorites: Book[];
  topThree: Book[];
  recommendations: Book[];
  personalizedBooks: Book[];
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  favoriteGenres: Record<string, number>;
  userNickname: string | null;
  currentGenreIndex: number;
  selectedGenres: string[];
  
  // Actions
  initializeBooks: (selectedGenres?: string[]) => Promise<void>;
  initializeTrendingBooks: () => Promise<void>;
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
  updateGenres: (genres: string[]) => Promise<void>;
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
      personalizedBooks: [],
      userProfile: null,
      isLoading: false,
      error: null,
      favoriteGenres: {},
      userNickname: null,
      currentGenreIndex: 0,
      selectedGenres: [],

      initializeBooks: async (selectedGenres = []) => {
        try {
          set({ isLoading: true, error: null });
          
          // Try to get books from storage first
          let books = await getAllBooks({ genres: selectedGenres, limit: 20 * selectedGenres.length });
          
          // If we don't have enough books per genre, fetch from API
          const booksPerGenre: Record<string, number> = {};
          books.forEach(book => {
            book.genres.forEach(genre => {
              if (selectedGenres.includes(genre)) {
                booksPerGenre[genre] = (booksPerGenre[genre] || 0) + 1;
              }
            });
          });

          const genresNeedingBooks = selectedGenres.filter(genre => 
            !booksPerGenre[genre] || booksPerGenre[genre] < 20
          );

          if (genresNeedingBooks.length > 0) {
            // Fetch books for each genre that needs more
            const apiBookPromises = genresNeedingBooks.map(genre => 
              getInitialBookList([genre])
            );
            
            const apiBookResults = await Promise.all(apiBookPromises);
            const apiBooks = apiBookResults.flat();
            
            // Store the new books
            await storeBooks(apiBooks);
            
            // Get updated book list from storage
            books = await getAllBooks({ 
              genres: selectedGenres, 
              limit: 20 * selectedGenres.length 
            });
          }
          
          // Ensure strict genre filtering - only include books that have at least one of the selected genres
          books = books.filter(book => {
            return book.genres.some(genre => selectedGenres.includes(genre));
          });
          
          // Group books by genre to ensure even distribution
          const booksByGenre: Record<string, Book[]> = {};
          selectedGenres.forEach(genre => {
            booksByGenre[genre] = [];
          });
          
          // Categorize books by genre
          books.forEach(book => {
            // Find all matching genres from selected genres
            const matchingGenres = book.genres.filter(genre => selectedGenres.includes(genre));
            
            if (matchingGenres.length > 0) {
              // Add book to all matching genre categories
              matchingGenres.forEach(genre => {
                booksByGenre[genre].push({...book});
              });
            }
          });
          
          // Shuffle each genre's books separately for variety
          for (const genre of selectedGenres) {
            booksByGenre[genre].sort(() => Math.random() - 0.5);
          }
          
          // Apply personalized recommendations if user has interaction history
          const { swipedBooks, userProfile } = get();
          let finalBooks: Book[];
          
          if (userProfile && swipedBooks.length >= 3) {
            // Use personalized recommendations
            const scoredBooks = RecommendationEngine.getPersonalizedRecommendations(
              books, 
              userProfile, 
              books.length
            );
            finalBooks = scoredBooks.map(scored => scored.book);
            set({ personalizedBooks: finalBooks });
          } else {
            // Interleave books from different genres (fallback)
            const interleavedBooks: Book[] = [];
            const maxBooksPerGenre = Math.max(...selectedGenres.map(genre => booksByGenre[genre].length));
            
            // Create a perfect cycle of genres
            for (let i = 0; i < maxBooksPerGenre; i++) {
              for (const genre of selectedGenres) {
                if (i < booksByGenre[genre].length) {
                  interleavedBooks.push(booksByGenre[genre][i]);
                }
              }
            }
            finalBooks = interleavedBooks;
          }
          
          set({ books: finalBooks, selectedGenres, isLoading: false });
        } catch (error: any) {
          console.error('Error initializing books:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      loadMoreBooks: async () => {
        const { books, selectedGenres } = get();
        
        try {
          set({ isLoading: true, error: null });
          
          // Get more books from storage, excluding ones we already have
          const existingIds = new Set(books.map(book => book.id));
          const moreBooks = (await getAllBooks({ 
            genres: selectedGenres, 
            limit: 20 * selectedGenres.length 
          })).filter(book => !existingIds.has(book.id));
          
          // Check if we have enough books per genre
          const booksPerGenre: Record<string, number> = {};
          moreBooks.forEach(book => {
            book.genres.forEach(genre => {
              if (selectedGenres.includes(genre)) {
                booksPerGenre[genre] = (booksPerGenre[genre] || 0) + 1;
              }
            });
          });

          const genresNeedingBooks = selectedGenres.filter(genre => 
            !booksPerGenre[genre] || booksPerGenre[genre] < 10
          );

          if (genresNeedingBooks.length > 0) {
            // Fetch more books for each genre that needs more
            const apiBookPromises = genresNeedingBooks.map(genre => 
              getInitialBookList([genre])
            );
            
            const apiBookResults = await Promise.all(apiBookPromises);
            const apiBooks = apiBookResults.flat()
              .filter(book => !existingIds.has(book.id));
            
            // Store the new books
            await storeBooks(apiBooks);
            
            // Add new books to the list
            moreBooks.push(...apiBooks);
          }
          
          // Ensure strict genre filtering - only include books that have at least one of the selected genres
          const filteredMoreBooks = moreBooks.filter(book => {
            return book.genres.some(genre => selectedGenres.includes(genre));
          });
          
          // Group books by genre to ensure even distribution
          const booksByGenre: Record<string, Book[]> = {};
          selectedGenres.forEach(genre => {
            booksByGenre[genre] = [];
          });
          
          // Categorize books by genre
          filteredMoreBooks.forEach(book => {
            // Find all matching genres from selected genres
            const matchingGenres = book.genres.filter(genre => selectedGenres.includes(genre));
            
            if (matchingGenres.length > 0) {
              // Add book to all matching genre categories
              matchingGenres.forEach(genre => {
                booksByGenre[genre].push({...book});
              });
            }
          });
          
          // Shuffle each genre's books separately for variety
          for (const genre of selectedGenres) {
            booksByGenre[genre].sort(() => Math.random() - 0.5);
          }
          
          // Interleave books from different genres
          const interleavedBooks: Book[] = [];
          const maxBooksPerGenre = Math.max(...selectedGenres.map(genre => booksByGenre[genre].length));
          
          // Create a perfect cycle of genres
          for (let i = 0; i < maxBooksPerGenre; i++) {
            for (const genre of selectedGenres) {
              if (i < booksByGenre[genre].length) {
                interleavedBooks.push(booksByGenre[genre][i]);
              }
            }
          }
          
          set({ 
            books: [...books, ...interleavedBooks],
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Error loading more books:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      swipeBook: async (liked: boolean) => {
        const { books, currentBookIndex, swipedBooks, favoriteGenres, userProfile } = get();
        const currentBook = books[currentBookIndex];
        
        if (!currentBook) return;
        
        // Update swipe history
        const newSwipedBooks = [
          ...swipedBooks,
          { bookId: currentBook.id, liked, timestamp: Date.now() }
        ];
        
        // Update favorite genres if liked
        const newFavoriteGenres = { ...favoriteGenres };
        if (liked && currentBook.genres) {
          currentBook.genres.forEach(genre => {
            newFavoriteGenres[genre] = (newFavoriteGenres[genre] || 0) + 1;
          });
        }
        
        // Update user profile with new interaction
        const newInteraction: BookInteraction = {
          bookId: currentBook.id,
          action: liked ? 'like' : 'dislike',
          timestamp: Date.now(),
          book: currentBook
        };
        
        const updatedProfile = userProfile 
          ? RecommendationEngine.updateProfileWithInteraction(userProfile, newInteraction)
          : RecommendationEngine.buildUserProfile([newInteraction]);
        
        // Update userStore with like/dislike
        const { updateLikedBooks, updateDislikedBooks } = useUserStore.getState();
        if (liked) {
          await updateLikedBooks(currentBook, true);
        } else {
          await updateDislikedBooks(currentBook, true);
        }
        
        // Store the book if liked
        if (liked) {
          await storeBook(currentBook);
        }
        
        set({
          currentBookIndex: currentBookIndex + 1,
          swipedBooks: newSwipedBooks,
          favoriteGenres: newFavoriteGenres,
          userProfile: updatedProfile
        });
        
        // Load more books if needed
        if (currentBookIndex >= books.length - 5) {
          await get().loadMoreBooks();
        }
      },

      generateRecommendations: async (limit = 5) => {
        const { swipedBooks, books, userProfile } = get();
        
        try {
          set({ isLoading: true, error: null });
          
          let recommendations: Book[];
          
          if (userProfile && swipedBooks.length >= 3) {
            // Use personalized recommendation engine
            const allAvailableBooks = await getAllBooks();
            const scoredBooks = RecommendationEngine.getPersonalizedRecommendations(
              allAvailableBooks,
              userProfile,
              limit * 2 // Get more to filter from
            );
            recommendations = scoredBooks.map(scored => scored.book).slice(0, limit);
          } else {
            // Fallback to original recommendation logic
            const likedBookIds = swipedBooks
              .filter(swipe => swipe.liked)
              .map(swipe => swipe.bookId);
            
            const likedBooks = books.filter(book => likedBookIds.includes(book.id));
            recommendations = await getBookRecommendations(likedBooks);
          }
          
          // Store recommendations
          await storeBooks(recommendations);
          
          set({ recommendations: recommendations.slice(0, limit), isLoading: false });
        } catch (error: any) {
          console.error('Error generating recommendations:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      addToFavorites: async (book: Book) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ error: 'You must be logged in to add favorites' });
          return;
        }

        try {
          set({ isLoading: true, error: null });

          // Update Firestore
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, {
            favorites: arrayUnion(book)
          });

          // Update local state
          const { favorites } = get();
          set({
            favorites: [...favorites, book],
            isLoading: false
          });
        } catch (error) {
          console.error('Error adding to favorites:', error);
          set({ error: 'Failed to add to favorites', isLoading: false });
        }
      },

      removeFromFavorites: async (bookId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ error: 'You must be logged in to remove favorites' });
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const { favorites } = get();
          const bookToRemove = favorites.find(b => b.id === bookId);
          
          if (!bookToRemove) {
            set({ error: 'Book not found in favorites', isLoading: false });
            return;
          }

          // Update Firestore
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, {
            favorites: arrayRemove(bookToRemove)
          });

          // Update local state
          set({
            favorites: favorites.filter(b => b.id !== bookId),
            isLoading: false
          });
        } catch (error) {
          console.error('Error removing from favorites:', error);
          set({ error: 'Failed to remove from favorites', isLoading: false });
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

      loadUserData: async () => {
        const { user } = useAuthStore.getState();
        console.log('Loading user data...', { user });

        try {
          set({ isLoading: true });
          
          // Clear previous state when loading new user data
          set({ topThree: [], favorites: [], favoriteGenres: {}, userNickname: null, userProfile: null });
          
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
              
              // Build user profile from interaction history
              const { swipedBooks } = get();
              if (swipedBooks.length > 0) {
                const allBooks = await getAllBooks();
                const interactions = RecommendationEngine.convertSwipesToInteractions(swipedBooks, allBooks);
                const profile = RecommendationEngine.buildUserProfile(interactions);
                set({ userProfile: profile });
              }
              
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
          set({ isLoading: true, error: null });
          
          // Clear previous state when loading other user's data
          set({ topThree: [], favorites: [], favoriteGenres: {}, userNickname: null });
          
          // Load user data from Firestore
          const userDocRef = doc(firestore, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Load top three books
            const topThree = data.topThree || [];
            
            // Load favorites if user's privacy settings allow it
            const favorites = data.privacySettings?.showFavorites ? (data.favorites || []) : [];
            
            // Load other public data
            const favoriteGenres = data.privacySettings?.showReadingActivity ? (data.favoriteGenres || {}) : {};
            const userNickname = data.nickname || null;
            
            // Update state with other user's data
            set({
              topThree,
              favorites,
              favoriteGenres,
              userNickname,
              error: null
            });
          } else {
            set({ error: 'User data not found' });
          }
        } catch (error) {
          console.error('Error loading other user data:', error);
          set({ error: 'Failed to load user data' });
        } finally {
          set({ isLoading: false });
        }
      },

      searchBooks: async (query: string): Promise<Book[]> => {
        try {
          console.log('bookStore: Starting search for:', query);
          set({ isLoading: true });
          
          // Search Google Books API directly
          console.log('bookStore: Calling Google Books API...');
          const apiBooks = await searchGoogleBooks(query);
          console.log('bookStore: API returned:', apiBooks);
          
          // Store new books for future use
          if (apiBooks.length > 0) {
            await storeBooks(apiBooks);
          }
          
          // Also check stored books for additional matches
          const storedBooks = await getAllBooks();
          const queryLower = query.toLowerCase();
          
          const matchingStored = storedBooks.filter((book: Book) => 
            book.title.toLowerCase().includes(queryLower) ||
            book.author.toLowerCase().includes(queryLower) ||
            book.genres?.some(genre => genre.toLowerCase().includes(queryLower))
          );
          
          // Combine results, prioritizing API results and removing duplicates
          const allResults = [...apiBooks, ...matchingStored];
          const uniqueResults = Array.from(
            new Map(allResults.map(book => [book.id, book])).values()
          );
          
          console.log('bookStore: Final results:', uniqueResults);
          return uniqueResults;
        } catch (error) {
          console.error('bookStore: Error searching books:', error);
          
          // If API fails, return any matching stored books we have
          try {
            const storedBooks = await getAllBooks();
            const queryLower = query.toLowerCase();
            
            return storedBooks.filter((book: Book) => 
              book.title.toLowerCase().includes(queryLower) ||
              book.author.toLowerCase().includes(queryLower) ||
              book.genres?.some(genre => genre.toLowerCase().includes(queryLower))
            );
          } catch (storageError) {
            console.error('bookStore: Error searching stored books:', storageError);
            return [];
          }
        } finally {
          set({ isLoading: false });
        }
      },

      updateGenres: async (genres: string[]) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          set({ isLoading: true });
          const userRef = doc(firestore, 'users', user.uid);
          await updateDoc(userRef, {
            selectedGenres: genres
          });
          set({ selectedGenres: genres });
          
          // Reinitialize books with new genres
          await get().initializeBooks(genres);
        } catch (error) {
          console.error('Error updating genres:', error);
          set({ error: 'Failed to update genres' });
        } finally {
          set({ isLoading: false });
        }
      },

      initializeTrendingBooks: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Get curated trending books
          const trendingBooks = await TrendingBooksService.getCuratedTrendingMix(30);
          
          if (trendingBooks.length === 0) {
            throw new Error('No trending books found');
          }
          
          // Store the trending books for future use
          await storeBooks(trendingBooks);
          
          // Shuffle for variety on each load
          const shuffledBooks = [...trendingBooks].sort(() => Math.random() - 0.5);
          
          set({ 
            books: shuffledBooks, 
            selectedGenres: ['trending'], 
            currentBookIndex: 0,
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Error initializing trending books:', error);
          set({ error: error.message || 'Failed to load trending books', isLoading: false });
        }
      },
    }),
    {
      name: 'book-store',
      partialize: (state) => ({
        favorites: state.favorites,
        topThree: state.topThree,
        swipedBooks: state.swipedBooks,
        selectedGenres: state.selectedGenres
      })
    }
  )
);