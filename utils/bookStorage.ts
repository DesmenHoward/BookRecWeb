import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '../types/book';

// Storage keys with namespacing for better organization
const STORAGE_KEYS = {
  BOOKS: '@bookrec/books',
  GENRE_BOOKS: '@bookrec/genre_books',
  CACHE_TIMESTAMP: '@bookrec/cache_timestamp',
  GENRE_CACHE: '@bookrec/genre_cache'
};

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Store books with genre mapping and caching
export const storeBooks = async (books: Book[]) => {
  try {
    // Get existing books
    const existingBooksJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
    const existingBooks = existingBooksJson ? JSON.parse(existingBooksJson) : [];
    
    // Create a map of existing books by ID for quick lookup
    const existingBooksMap = new Map(existingBooks.map((book: Book) => [book.id, book]));
    
    // Add new books to the map
    books.forEach(book => {
      existingBooksMap.set(book.id, book);
    });
    
    // Convert map back to array
    const updatedBooks = Array.from(existingBooksMap.values());
    
    // Store updated books
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
    await AsyncStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    
    // Update genre mapping
    const genreMappingJson = await AsyncStorage.getItem(STORAGE_KEYS.GENRE_BOOKS);
    const genreMapping = genreMappingJson ? JSON.parse(genreMappingJson) : {};
    
    // Add books to their respective genre lists
    books.forEach(book => {
      book.genres.forEach(genre => {
        if (!genreMapping[genre]) {
          genreMapping[genre] = {
            bookIds: [],
            lastUpdated: Date.now()
          };
        }
        if (!genreMapping[genre].bookIds.includes(book.id)) {
          genreMapping[genre].bookIds.push(book.id);
          genreMapping[genre].lastUpdated = Date.now();
        }
      });
    });
    
    await AsyncStorage.setItem(STORAGE_KEYS.GENRE_BOOKS, JSON.stringify(genreMapping));
    
    return true;
  } catch (error) {
    console.error('Error storing books:', error);
    return false;
  }
};

// Get all books with optional filtering and caching
export const getAllBooks = async (options?: {
  genres?: string[];
  limit?: number;
  forceRefresh?: boolean;
}): Promise<Book[]> => {
  try {
    let books: Book[] = [];
    
    if (options?.genres?.length) {
      // Get genre mapping
      const genreMappingJson = await AsyncStorage.getItem(STORAGE_KEYS.GENRE_BOOKS);
      const genreMapping = genreMappingJson ? JSON.parse(genreMappingJson) : {};
      
      // Check if we need to refresh the cache for any genre
      const needsRefresh = options.forceRefresh || options.genres.some(genre => {
        const genreCache = genreMapping[genre];
        if (!genreCache) return true;
        
        const cacheAge = Date.now() - genreCache.lastUpdated;
        return cacheAge > CACHE_DURATION;
      });
      
      if (!needsRefresh) {
        // Get all book IDs for the requested genres
        const bookIds = new Set<string>();
        options.genres.forEach(genre => {
          if (genreMapping[genre]) {
            genreMapping[genre].bookIds.forEach((id: string) => bookIds.add(id));
          }
        });
        
        // Get all books
        const allBooksJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
        const allBooks: Book[] = allBooksJson ? JSON.parse(allBooksJson) : [];
        
        // Filter books by IDs from requested genres
        books = allBooks.filter(book => bookIds.has(book.id));
      }
    } else {
      // If no genres specified, get all books
      const booksJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
      books = booksJson ? JSON.parse(booksJson) : [];
    }
    
    // Shuffle books for variety
    books = [...books].sort(() => Math.random() - 0.5);
    
    // Apply limit if specified
    if (options?.limit) {
      books = books.slice(0, options.limit);
    }
    
    return books;
  } catch (error) {
    console.error('Error getting books:', error);
    return [];
  }
};

// Get books by genre with caching
export const getBooksByGenre = async (genre: string, limit?: number): Promise<Book[]> => {
  return getAllBooks({ genres: [genre], limit });
};

// Get book by ID
export const getBookById = async (bookId: string): Promise<Book | null> => {
  try {
    const booksJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
    const books: Book[] = booksJson ? JSON.parse(booksJson) : [];
    return books.find(book => book.id === bookId) || null;
  } catch (error) {
    console.error('Error getting book by ID:', error);
    return null;
  }
};

// Store a single book
export const storeBook = async (book: Book) => {
  return storeBooks([book]);
};

// Clear expired cache for specific genres
export const clearExpiredGenreCache = async (genres: string[]) => {
  try {
    const genreMappingJson = await AsyncStorage.getItem(STORAGE_KEYS.GENRE_BOOKS);
    if (!genreMappingJson) return;
    
    const genreMapping = JSON.parse(genreMappingJson);
    let updated = false;
    
    genres.forEach(genre => {
      if (genreMapping[genre]) {
        const cacheAge = Date.now() - genreMapping[genre].lastUpdated;
        if (cacheAge > CACHE_DURATION) {
          delete genreMapping[genre];
          updated = true;
        }
      }
    });
    
    if (updated) {
      await AsyncStorage.setItem(STORAGE_KEYS.GENRE_BOOKS, JSON.stringify(genreMapping));
    }
  } catch (error) {
    console.error('Error clearing genre cache:', error);
  }
};

export { getAllBooks, getBooksByGenre, getBookById, storeBook, storeBooks, clearExpiredGenreCache };