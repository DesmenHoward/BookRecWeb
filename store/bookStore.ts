import { create } from 'zustand';
import { Book, SwipeAction } from '../types/book';
import { getInitialBookList, getBookRecommendations } from '../utils/googleBooks';
import { getRandomPun } from '../utils/genrePuns';
import { firestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { useAuthStore } from './authStore';

interface GenreCount {
  [genre: string]: number;
}

interface BookState {
  books: Book[];
  currentBookIndex: number;
  swipedBooks: SwipeAction[];
  favorites: Book[];
  recommendations: Book[];
  isLoading: boolean;
  error: string | null;
  favoriteGenres: GenreCount;
  userNickname: string | null;
  
  // Actions
  initializeBooks: (selectedGenres?: string[], limit?: number) => Promise<void>;
  swipeBook: (liked: boolean) => Promise<void>;
  generateRecommendations: (limit?: number) => Promise<void>;
  addToFavorites: (book: Book) => Promise<void>;
  removeFromFavorites: (bookId: string) => Promise<void>;
  updateFavoriteGenres: () => void;
  getMostLikedGenre: () => string | null;
  generateUserNickname: () => void;
  updateBookStatus: (bookId: string, status: 'already-read' | 'read-later' | 'not-interested' | null) => Promise<void>;
  retryInitializeBooks: () => Promise<void>;
  loadUserData: () => Promise<void>;
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

  loadUserData: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true, error: null });

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        set({
          swipedBooks: userData.swipedBooks || [],
          favorites: userData.favorites || [],
          favoriteGenres: userData.favoriteGenres || {},
          userNickname: userData.nickname || null
        });
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  initializeBooks: async (selectedGenres, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const books = await getInitialBookList(selectedGenres);
      set({ 
        books: books.slice(0, limit), // Only take the specified number of books
        currentBookIndex: 0,
        isLoading: false 
      });
      
      // Load user data after books are initialized
      await get().loadUserData();
    } catch (error: any) {
      set({ 
        error: 'Failed to load books. Please try again later.', 
        isLoading: false 
      });
    }
  },

  swipeBook: async (liked: boolean) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { books, currentBookIndex, swipedBooks } = get();
    
    if (currentBookIndex >= books.length) {
      return;
    }

    const currentBook = books[currentBookIndex];
    const newSwipe = { bookId: currentBook.id, liked };
    
    try {
      // Update Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        swipedBooks: arrayUnion(newSwipe)
      });

      // Update local state
      const newSwipedBooks = [...swipedBooks, newSwipe];
      set({
        swipedBooks: newSwipedBooks,
        currentBookIndex: currentBookIndex + 1
      });

      if (liked) {
        get().updateFavoriteGenres();
        get().generateUserNickname();
      }

      if (newSwipedBooks.length === 3) {
        get().generateRecommendations(5);
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  generateRecommendations: async (limit = 5) => {
    const { swipedBooks, books } = get();
    
    if (swipedBooks.length < 3) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const likedBooks = swipedBooks
        .filter(swipe => swipe.liked)
        .map(swipe => books.find(book => book.id === swipe.bookId))
        .filter(book => book !== undefined) as Book[];

      const recommendations = await getBookRecommendations(likedBooks);
      set({ recommendations: recommendations.slice(0, limit), isLoading: false });
    } catch (error: any) {
      set({ 
        error: 'Failed to generate recommendations. Please try again.', 
        isLoading: false 
      });
    }
  },

  addToFavorites: async (book: Book) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { favorites } = get();
    
    if (!favorites.some(fav => fav.id === book.id)) {
      try {
        // Update Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
          favorites: arrayUnion(book)
        });

        // Update local state
        const newFavorites = [...favorites, book];
        set({ favorites: newFavorites });
        
        get().updateFavoriteGenres();
        get().generateUserNickname();
      } catch (error: any) {
        set({ error: error.message });
      }
    }
  },

  removeFromFavorites: async (bookId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { favorites } = get();
    const bookToRemove = favorites.find(book => book.id === bookId);
    
    if (bookToRemove) {
      try {
        // Update Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
          favorites: arrayRemove(bookToRemove)
        });

        // Update local state
        const newFavorites = favorites.filter(book => book.id !== bookId);
        set({ favorites: newFavorites });
        
        get().updateFavoriteGenres();
        get().generateUserNickname();
      } catch (error: any) {
        set({ error: error.message });
      }
    }
  },

  updateFavoriteGenres: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { favorites, swipedBooks, books } = get();
    const genreCounts: GenreCount = {};
    
    swipedBooks.forEach(swipe => {
      if (swipe.liked) {
        const book = books.find(b => b.id === swipe.bookId);
        if (book) {
          book.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      }
    });
    
    favorites.forEach(book => {
      book.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    try {
      // Update Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        favoriteGenres: genreCounts
      });

      // Update local state
      set({ favoriteGenres: genreCounts });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  getMostLikedGenre: () => {
    const { favoriteGenres } = get();
    
    if (Object.keys(favoriteGenres).length === 0) {
      return null;
    }
    
    let maxCount = 0;
    let mostLikedGenre = null;
    
    Object.entries(favoriteGenres).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostLikedGenre = genre;
      }
    });
    
    return mostLikedGenre;
  },

  generateUserNickname: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const mostLikedGenre = get().getMostLikedGenre();
    
    if (!mostLikedGenre) {
      set({ userNickname: null });
      return;
    }
    
    const nickname = getRandomPun(mostLikedGenre);

    try {
      // Update Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        nickname: nickname
      });

      // Update local state
      set({ userNickname: nickname });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateBookStatus: async (bookId: string, status: 'already-read' | 'read-later' | 'not-interested' | null) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { recommendations } = get();
    
    try {
      // Update Firestore
      const bookStatusRef = doc(firestore, `users/${user.uid}/bookStatuses/${bookId}`);
      await setDoc(bookStatusRef, { status }, { merge: true });

      // Update local state
      const updatedRecommendations = recommendations.map(book => 
        book.id === bookId ? { ...book, status } : book
      );
      
      set({ recommendations: updatedRecommendations });
      
      if (status === 'read-later') {
        const book = recommendations.find(b => b.id === bookId);
        if (book && !get().favorites.some(fav => fav.id === bookId)) {
          await get().addToFavorites(book);
        }
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  retryInitializeBooks: async () => {
    await get().initializeBooks();
  }
}));

export { useBookStore }

export { useBookStore }