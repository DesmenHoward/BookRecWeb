import localforage from 'localforage';
import { Book } from '../types/book';

// Configure localforage instances for different storage needs
const bookStore = localforage.createInstance({
  name: 'bookRec',
  storeName: 'books'
});

const genreStore = localforage.createInstance({
  name: 'bookRec',
  storeName: 'genres'
});

const genreMetaStore = localforage.createInstance({
  name: 'bookRec',
  storeName: 'genreMeta'
});

// Cache duration in milliseconds (7 days)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface GenreCache {
  bookIds: string[];
  lastUpdated: number;
  totalBooks: number;
}

interface GenreMeta {
  lastFetched: number;
  totalBooks: number;
  isFullyLoaded: boolean;
}

// Store a book with its metadata
export const storeBook = async (book: Book): Promise<void> => {
  try {
    const entry: CacheEntry<Book> = {
      data: book,
      timestamp: Date.now()
    };
    await bookStore.setItem(book.id, entry);

    // Store book ID in genre mappings
    for (const genre of book.genres) {
      const genreCache = await genreStore.getItem<GenreCache>(genre) || {
        bookIds: [],
        lastUpdated: Date.now(),
        totalBooks: 0
      };
      
      if (!genreCache.bookIds.includes(book.id)) {
        genreCache.bookIds.push(book.id);
        genreCache.lastUpdated = Date.now();
        genreCache.totalBooks = genreCache.bookIds.length;
        await genreStore.setItem(genre, genreCache);
      }
    }
  } catch (error) {
    console.error('Error storing book:', error);
    throw error;
  }
};

// Store multiple books
export const storeBooks = async (books: Book[], genre?: string): Promise<void> => {
  try {
    await Promise.all(books.map(book => storeBook(book)));

    // Update genre metadata if a specific genre is provided
    if (genre) {
      const meta = await genreMetaStore.getItem<GenreMeta>(genre) || {
        lastFetched: Date.now(),
        totalBooks: 0,
        isFullyLoaded: false
      };

      meta.totalBooks += books.length;
      meta.lastFetched = Date.now();
      meta.isFullyLoaded = meta.totalBooks >= 100; // Consider genre fully loaded if we have 100+ books

      await genreMetaStore.setItem(genre, meta);
    }
  } catch (error) {
    console.error('Error storing books:', error);
    throw error;
  }
};

// Get a book by ID
export const getBook = async (bookId: string): Promise<Book | null> => {
  try {
    const entry = await bookStore.getItem<CacheEntry<Book>>(bookId);
    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      await bookStore.removeItem(bookId);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Error getting book:', error);
    return null;
  }
};

// Get books by genre
export const getBooksByGenre = async (genre: string): Promise<Book[]> => {
  try {
    const genreCache = await genreStore.getItem<GenreCache>(genre);
    if (!genreCache) return [];

    // Check if genre cache is expired
    if (Date.now() - genreCache.lastUpdated > CACHE_DURATION) {
      await genreStore.removeItem(genre);
      return [];
    }

    const books = await Promise.all(
      genreCache.bookIds.map(id => getBook(id))
    );

    return books.filter((book): book is Book => book !== null);
  } catch (error) {
    console.error('Error getting books by genre:', error);
    return [];
  }
};

// Get all books
export const getAllBooks = async (): Promise<Book[]> => {
  try {
    const books: Book[] = [];
    await bookStore.iterate<CacheEntry<Book>, void>((entry, key) => {
      if (Date.now() - entry.timestamp <= CACHE_DURATION) {
        books.push(entry.data);
      } else {
        // Remove expired entries
        bookStore.removeItem(key);
      }
    });
    return books;
  } catch (error) {
    console.error('Error getting all books:', error);
    return [];
  }
};

// Check if a genre needs more books
export const shouldFetchMoreBooks = async (genre: string): Promise<boolean> => {
  try {
    const meta = await genreMetaStore.getItem<GenreMeta>(genre);
    if (!meta) return true;

    // Fetch more books if:
    // 1. Genre is not fully loaded AND
    // 2. Either cache is expired OR we have less than 50 books
    return !meta.isFullyLoaded && (
      Date.now() - meta.lastFetched > CACHE_DURATION ||
      meta.totalBooks < 50
    );
  } catch (error) {
    console.error('Error checking genre status:', error);
    return true;
  }
};

// Get genre metadata
export const getGenreMeta = async (genre: string): Promise<GenreMeta | null> => {
  try {
    return await genreMetaStore.getItem<GenreMeta>(genre);
  } catch (error) {
    console.error('Error getting genre metadata:', error);
    return null;
  }
};

// Clear expired cache entries
export const clearExpiredCache = async (): Promise<void> => {
  try {
    // Clear expired books
    await bookStore.iterate<CacheEntry<Book>, void>((entry, key) => {
      if (Date.now() - entry.timestamp > CACHE_DURATION) {
        bookStore.removeItem(key);
      }
    });

    // Clear expired genre mappings
    await genreStore.iterate<GenreCache, void>((cache, genre) => {
      if (Date.now() - cache.lastUpdated > CACHE_DURATION) {
        genreStore.removeItem(genre);
      }
    });

    // Clear expired genre metadata
    await genreMetaStore.iterate<GenreMeta, void>((meta, genre) => {
      if (Date.now() - meta.lastFetched > CACHE_DURATION) {
        genreMetaStore.removeItem(genre);
      }
    });
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    throw error;
  }
};

// Clear all cached data
export const clearAllCache = async (): Promise<void> => {
  try {
    await Promise.all([
      bookStore.clear(),
      genreStore.clear(),
      genreMetaStore.clear()
    ]);
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
};