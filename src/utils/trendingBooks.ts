import { Book } from '../types/book';
import { convertGoogleBook } from './googleBooks';

/**
 * Service to fetch trending/popular books
 * Uses Google Books API with popular search terms and recent publications
 */
export class TrendingBooksService {
  private static readonly TRENDING_QUERIES = [
    'bestseller 2024',
    'popular fiction 2024',
    'trending books',
    'new releases',
    'award winning books',
    'book club picks',
    'must read 2024',
    'popular romance',
    'trending mystery',
    'bestselling fantasy'
  ];

  private static readonly POPULAR_GENRES = [
    'Fiction',
    'Romance',
    'Mystery',
    'Fantasy',
    'Science Fiction',
    'Thriller',
    'Contemporary Fiction',
    'Young Adult',
    'Historical Fiction',
    'Literary Fiction'
  ];

  /**
   * Fetch trending books using multiple strategies
   */
  static async getTrendingBooks(limit: number = 30): Promise<Book[]> {
    try {
      const allBooks: Book[] = [];
      
      // Strategy 1: Use trending search queries
      const queryPromises = this.TRENDING_QUERIES.slice(0, 5).map(query => 
        this.fetchBooksFromQuery(query, 6)
      );
      
      const queryResults = await Promise.allSettled(queryPromises);
      queryResults.forEach(result => {
        if (result.status === 'fulfilled') {
          allBooks.push(...result.value);
        }
      });

      // Strategy 2: Get recent popular books by genre
      const genrePromises = this.POPULAR_GENRES.slice(0, 3).map(genre =>
        this.fetchRecentPopularByGenre(genre, 4)
      );
      
      const genreResults = await Promise.allSettled(genrePromises);
      genreResults.forEach(result => {
        if (result.status === 'fulfilled') {
          allBooks.push(...result.value);
        }
      });

      // Remove duplicates and filter for quality
      const uniqueBooks = this.removeDuplicatesAndFilter(allBooks);
      
      // Sort by a combination of rating and review count
      const sortedBooks = uniqueBooks.sort((a, b) => {
        const scoreA = (a.rating || 0) * Math.log(Math.max(a.reviewCount || 1, 1));
        const scoreB = (b.rating || 0) * Math.log(Math.max(b.reviewCount || 1, 1));
        return scoreB - scoreA;
      });

      return sortedBooks.slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending books:', error);
      // Fallback to basic popular search
      return this.fetchBooksFromQuery('bestseller books', limit);
    }
  }

  /**
   * Fetch books from a specific search query
   */
  private static async fetchBooksFromQuery(query: string, maxResults: number): Promise<Book[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&orderBy=relevance&maxResults=${maxResults}&printType=books&langRestrict=en`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items) {
        return [];
      }

      return data.items
        .map((item: any) => {
          try {
            return convertGoogleBook(item);
          } catch (error) {
            console.warn('Error converting book:', error);
            return null;
          }
        })
        .filter((book: Book | null): book is Book => book !== null);
    } catch (error) {
      console.error(`Error fetching books for query "${query}":`, error);
      return [];
    }
  }

  /**
   * Fetch recent popular books by genre
   */
  private static async fetchRecentPopularByGenre(genre: string, maxResults: number): Promise<Book[]> {
    try {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      
      // Search for books in this genre from recent years
      const query = `subject:${genre} publishedDate:${lastYear}-${currentYear}`;
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&orderBy=relevance&maxResults=${maxResults}&printType=books&langRestrict=en`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items) {
        return [];
      }

      return data.items
        .map((item: any) => {
          try {
            return convertGoogleBook(item);
          } catch (error) {
            console.warn('Error converting book:', error);
            return null;
          }
        })
        .filter((book: Book | null): book is Book => book !== null);
    } catch (error) {
      console.error(`Error fetching recent books for genre "${genre}":`, error);
      return [];
    }
  }

  /**
   * Remove duplicates and filter for quality books
   */
  private static removeDuplicatesAndFilter(books: Book[]): Book[] {
    const seen = new Set<string>();
    const filtered: Book[] = [];

    for (const book of books) {
      // Skip if we've seen this book already
      if (seen.has(book.id)) {
        continue;
      }

      // Quality filters
      if (!book.title || !book.author || !book.coverUrl) {
        continue;
      }

      // Skip books with very short descriptions (likely incomplete data)
      if (book.description && book.description.length < 50) {
        continue;
      }

      // Skip books without proper cover images
      if (book.coverUrl.includes('no-cover') || book.coverUrl.includes('default')) {
        continue;
      }

      seen.add(book.id);
      filtered.push(book);
    }

    return filtered;
  }

  /**
   * Get a curated mix of trending books across different categories
   */
  static async getCuratedTrendingMix(limit: number = 25): Promise<Book[]> {
    try {
      const categories = [
        { query: 'bestseller fiction 2024', count: 8 },
        { query: 'popular romance books', count: 5 },
        { query: 'trending mystery thriller', count: 5 },
        { query: 'new fantasy releases', count: 4 },
        { query: 'award winning literature', count: 3 }
      ];

      const promises = categories.map(({ query, count }) => 
        this.fetchBooksFromQuery(query, count)
      );

      const results = await Promise.allSettled(promises);
      const allBooks: Book[] = [];

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allBooks.push(...result.value);
        }
      });

      const uniqueBooks = this.removeDuplicatesAndFilter(allBooks);
      
      // Shuffle for variety
      const shuffled = uniqueBooks.sort(() => Math.random() - 0.5);
      
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error('Error getting curated trending mix:', error);
      return this.getTrendingBooks(limit);
    }
  }
}
