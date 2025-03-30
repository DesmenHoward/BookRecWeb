import { Book } from '../types/book';

// Storage keys with namespacing for better organization
const STORAGE_KEYS = {
  BOOKS: '@bookrec/books',
  GENRE_BOOKS: '@bookrec/genre_books',
  CACHE_TIMESTAMP: '@bookrec/cache_timestamp',
  GENRE_CACHE: '@bookrec/genre_cache',
  GENRE_META: '@bookrec/genre_meta'
};

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface GenreMeta {
  lastUpdated: number;
  totalBooks: number;
  avgRating: number;
}

// Store books with genre mapping and caching
export const storeBooks = async (books: Book[]) => {
  try {
    // Get existing books
    const existingBooksJson = localStorage.getItem(STORAGE_KEYS.BOOKS);
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
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
    localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    
    // Update genre mapping
    const genreMappingJson = localStorage.getItem(STORAGE_KEYS.GENRE_BOOKS);
    const genreMapping = genreMappingJson ? JSON.parse(genreMappingJson) : {};
    
    // Get genre metadata
    const genreMetaJson = localStorage.getItem(STORAGE_KEYS.GENRE_META);
    const genreMeta = genreMetaJson ? JSON.parse(genreMetaJson) : {};
    
    // Add books to their respective genre lists and update metadata
    books.forEach(book => {
      if (!book.genres) return;
      
      book.genres.forEach(genre => {
        // Initialize genre mapping if it doesn't exist
        if (!genreMapping[genre]) {
          genreMapping[genre] = {
            bookIds: [],
            lastUpdated: Date.now()
          };
        }
        
        // Add book to genre if not already present
        if (!genreMapping[genre].bookIds.includes(book.id)) {
          genreMapping[genre].bookIds.push(book.id);
          genreMapping[genre].lastUpdated = Date.now();
          
          // Update genre metadata
          if (!genreMeta[genre]) {
            genreMeta[genre] = {
              lastUpdated: Date.now(),
              totalBooks: 0,
              avgRating: 0
            };
          }
          
          const meta = genreMeta[genre];
          meta.totalBooks++;
          if (book.rating) {
            meta.avgRating = (meta.avgRating * (meta.totalBooks - 1) + book.rating) / meta.totalBooks;
          }
          meta.lastUpdated = Date.now();
        }
      });
    });
    
    // Save updated genre mapping and metadata
    localStorage.setItem(STORAGE_KEYS.GENRE_BOOKS, JSON.stringify(genreMapping));
    localStorage.setItem(STORAGE_KEYS.GENRE_META, JSON.stringify(genreMeta));
    
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
      const genreMappingJson = localStorage.getItem(STORAGE_KEYS.GENRE_BOOKS);
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
        const allBooksJson = localStorage.getItem(STORAGE_KEYS.BOOKS);
        const allBooks: Book[] = allBooksJson ? JSON.parse(allBooksJson) : [];
        
        // Filter books by IDs from requested genres
        books = allBooks.filter(book => bookIds.has(book.id));
      }
    } else {
      // If no genres specified, get all books
      const booksJson = localStorage.getItem(STORAGE_KEYS.BOOKS);
      books = booksJson ? JSON.parse(booksJson) : [];
    }
    
    // Sort books by rating and recency
    books.sort((a, b) => {
      // First by rating (if available)
      if (a.rating && b.rating) {
        if (a.rating !== b.rating) {
          return b.rating - a.rating;
        }
      }
      // Then by published year (if available)
      if (a.publishedYear && b.publishedYear) {
        return b.publishedYear - a.publishedYear;
      }
      return 0;
    });
    
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
    const booksJson = localStorage.getItem(STORAGE_KEYS.BOOKS);
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

// Get genre metadata
export const getGenreMeta = async (genre: string): Promise<GenreMeta | null> => {
  try {
    const metaJson = localStorage.getItem(STORAGE_KEYS.GENRE_META);
    const meta = metaJson ? JSON.parse(metaJson) : {};
    return meta[genre] || null;
  } catch (error) {
    console.error('Error getting genre metadata:', error);
    return null;
  }
};

// Clear expired cache for specific genres
export const clearExpiredGenreCache = async (genres: string[]) => {
  try {
    const genreMappingJson = localStorage.getItem(STORAGE_KEYS.GENRE_BOOKS);
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
      localStorage.setItem(STORAGE_KEYS.GENRE_BOOKS, JSON.stringify(genreMapping));
    }
  } catch (error) {
    console.error('Error clearing genre cache:', error);
  }
};