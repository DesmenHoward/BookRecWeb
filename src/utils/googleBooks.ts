import axios from 'axios';
import { GoogleBook, Book } from '../types/book';
import * as storage from './storage';
import { env } from '../config/env';

const API_BASE_URL = 'https://www.googleapis.com/books/v1';
const API_KEY = env.googleBooks.apiKey;

// Helper function to clean and validate description text
function cleanDescription(text: string): string {
  if (!text) return 'No description available.';
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Fix common encoding issues
  text = text.replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
  
  // Remove multiple spaces and line breaks
  text = text.replace(/\s+/g, ' ').trim();
  
  // Ensure proper sentence spacing
  text = text.replace(/\.\s*([A-Z])/g, '. $1');
  
  return text;
}

// Helper function to detect if text is likely English
function isEnglishText(text: string): boolean {
  // Basic English character pattern
  const englishPattern = /^[A-Za-z0-9\s.,!?'"-:;()&]+$/;
  
  // Sample the first 100 characters for performance
  const sample = text.slice(0, 100);
  
  // Check if the text matches English pattern and contains common English words
  const commonEnglishWords = ['the', 'and', 'in', 'of', 'to', 'a'];
  const words = text.toLowerCase().split(/\s+/);
  const hasEnglishWords = commonEnglishWords.some(word => words.includes(word));
  
  return englishPattern.test(sample) && hasEnglishWords;
}

function getCoverUrl(imageLinks?: { thumbnail?: string; smallThumbnail?: string }, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const defaultCover = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop';
  
  if (!imageLinks) {
    return `${defaultCover}&w=${size === 'small' ? 400 : size === 'medium' ? 600 : 800}&q=80`;
  }
  
  try {
    const secureUrl = (url: string) => {
      // Convert to HTTPS and remove edge=curl parameter
      let processedUrl = url
        .replace('http://', 'https://')
        .replace('&edge=curl', '');

      // Get dimensions based on size
      const dimensions = {
        small: { w: 400, h: 600 },
        medium: { w: 600, h: 900 },
        large: { w: 800, h: 1200 }
      }[size];

      // Upgrade image quality and size
      processedUrl = processedUrl
        .replace('zoom=1', 'zoom=3')  // Higher quality zoom
        .replace(/w=\d+/, `w=${dimensions.w}`)
        .replace(/h=\d+/, `h=${dimensions.h}`)
        .replace(/&fife=[^&]*/, `&fife=w${dimensions.w}-h${dimensions.h}`);

      return processedUrl;
    };
    
    // Try to get the best quality image available
    if (imageLinks.thumbnail) {
      return secureUrl(imageLinks.thumbnail);
    }
    
    if (imageLinks.smallThumbnail) {
      return secureUrl(imageLinks.smallThumbnail);
    }
  } catch (error) {
    console.error('Error processing cover URL:', error);
  }
  
  return `${defaultCover}&w=${size === 'small' ? 400 : size === 'medium' ? 600 : 800}&q=80`;
}

export function convertGoogleBook(googleBook: GoogleBook): Book | null {
  try {
    if (!googleBook?.volumeInfo) return null;

    const { volumeInfo } = googleBook;
    
    if (!volumeInfo.title || !volumeInfo.authors?.length) {
      return null;
    }

    // Skip books without English descriptions
    const description = cleanDescription(volumeInfo.description);
    if (!isEnglishText(description)) {
      return null;
    }

    // Get cover URLs for different sizes
    const defaultCover = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop';
    const coverImages = {
      small: getCoverUrl(volumeInfo.imageLinks, 'small'),
      medium: getCoverUrl(volumeInfo.imageLinks, 'medium'),
      large: getCoverUrl(volumeInfo.imageLinks, 'large')
    };

    return {
      id: googleBook.id,
      title: volumeInfo.title,
      author: volumeInfo.authors[0],
      description,
      coverUrl: coverImages.medium, // Keep coverUrl for backward compatibility
      coverImages,
      genres: volumeInfo.categories || ['Fiction'],
      publishedYear: volumeInfo.publishedDate ? 
        new Date(volumeInfo.publishedDate).getFullYear() : 
        new Date().getFullYear(),
      rating: volumeInfo.averageRating || 0
    };
  } catch (error) {
    console.error('Error converting Google Book:', error);
    return null;
  }
}

async function fetchBooksForGenre(genre: string, maxResults: number = 40): Promise<Book[]> {
  const response = await axios.get(`${API_BASE_URL}/volumes`, {
    params: {
      q: `subject:"${genre}"`,
      maxResults,
      langRestrict: 'en',
      orderBy: 'relevance',
      key: API_KEY,
      fields: 'items(id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating))',
      printType: 'books'
    }
  });

  if (!response.data?.items) return [];

  const books = response.data.items
    .map(convertGoogleBook)
    .filter((book: Book | null) => 
      book !== null &&
      book.description.length > 100 &&
      book.genres.includes(genre)
    );

  // Store books with genre metadata
  if (books.length > 0) {
    await storage.storeBooks(books, genre);
  }

  return books;
}

export async function getInitialBookList(selectedGenres?: string[]): Promise<Book[]> {
  if (!API_KEY) {
    throw new Error('Google Books API key is not configured');
  }

  try {
    const genreBooks: Record<string, Book[]> = {};
    const booksPerGenre = 20; // Number of books to fetch per genre

    if (selectedGenres?.length) {
      // Process each genre
      for (const genre of selectedGenres) {
        // Check if we need more books for this genre
        const needsMoreBooks = await storage.shouldFetchMoreBooks(genre);
        
        // First try to get cached books
        let books = await storage.getBooksByGenre(genre);
        
        // If we need more books, fetch them from API
        if (needsMoreBooks || books.length < booksPerGenre) {
          const newBooks = await fetchBooksForGenre(genre);
          books = [...new Set([...books, ...newBooks])];
        }
        
        // Store books for this genre
        genreBooks[genre] = books;
      }

      // Create a balanced mix of books from all genres
      const mixedBooks: Book[] = [];
      let genreIndex = 0;
      
      // Keep adding books until we have enough or run out of books
      while (mixedBooks.length < 40 && Object.values(genreBooks).some(books => books.length > 0)) {
        const currentGenre = selectedGenres[genreIndex];
        const genreBookList = genreBooks[currentGenre];
        
        if (genreBookList.length > 0) {
          // Take a random book from this genre
          const randomIndex = Math.floor(Math.random() * genreBookList.length);
          const book = genreBookList[randomIndex];
          
          // Only add if not already in mixedBooks
          if (!mixedBooks.some(b => b.id === book.id)) {
            mixedBooks.push(book);
          }
          
          // Remove the book from the genre's list
          genreBookList.splice(randomIndex, 1);
        }
        
        // Move to next genre
        genreIndex = (genreIndex + 1) % selectedGenres.length;
      }

      return mixedBooks;
    }

    // If no genres specified, use default fiction genre
    const defaultBooks = await storage.getBooksByGenre('Fiction');
    if (defaultBooks.length < 20) {
      const newBooks = await fetchBooksForGenre('Fiction');
      return [...new Set([...defaultBooks, ...newBooks])]
        .sort(() => Math.random() - 0.5)
        .slice(0, 40);
    }

    return defaultBooks
      .sort(() => Math.random() - 0.5)
      .slice(0, 40);
  } catch (error: any) {
    console.error('Error fetching books:', error);
    throw new Error('Failed to fetch books. Please try again later.');
  }
}

export async function getBookRecommendations(likedBooks: Book[]): Promise<Book[]> {
  if (!likedBooks?.length || !API_KEY) {
    return [];
  }

  try {
    const likedAuthors = [...new Set(likedBooks.map(book => book.author))];
    const likedGenres = [...new Set(likedBooks.flatMap(book => book.genres))];
    const recommendations: Book[] = [];
    
    // First try to get recommendations from cache
    for (const genre of likedGenres) {
      const genreBooks = await storage.getBooksByGenre(genre);
      recommendations.push(
        ...genreBooks.filter((book: Book) => 
          !likedBooks.some(liked => liked.id === book.id) &&
          !recommendations.some(rec => rec.id === book.id)
        )
      );
    }

    // If we don't have enough recommendations, fetch more from API
    if (recommendations.length < 20) {
      // Fetch books by authors
      for (const author of likedAuthors) {
        const response = await axios.get(`${API_BASE_URL}/volumes`, {
          params: {
            q: `inauthor:"${author}" subject:(${likedGenres.join(' OR ')})`,
            maxResults: 10,
            langRestrict: 'en',
            orderBy: 'relevance',
            key: API_KEY,
            fields: 'items(id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating))',
            printType: 'books'
          }
        });
        
        if (response.data?.items) {
          const authorBooks = response.data.items
            .map(convertGoogleBook)
            .filter((book: Book | null) => 
              book !== null &&
              !likedBooks.some(liked => liked.id === book.id) &&
              !recommendations.some(rec => rec.id === book.id) &&
              book.description.length > 100 &&
              book.genres.some(g => likedGenres.includes(g))
            );
          
          recommendations.push(...authorBooks);
        }
      }

      // If still not enough, fetch more by genres
      if (recommendations.length < 20) {
        for (const genre of likedGenres) {
          if (recommendations.length >= 20) break;
          
          const genreBooks = await fetchBooksForGenre(genre, 10);
          recommendations.push(
            ...genreBooks.filter((book: Book) =>
              !likedBooks.some(liked => liked.id === book.id) &&
              !recommendations.some(rec => rec.id === book.id)
            )
          );
        }
      }
    }
    
    // Store all recommendations
    await storage.storeBooks(recommendations);
    
    // Return shuffled, unique recommendations
    return [...new Set(recommendations)]
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    throw new Error('Failed to fetch book recommendations');
  }
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query?.trim() || !API_KEY) {
    return [];
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/volumes`, {
      params: {
        q: query,
        maxResults: 20,
        langRestrict: 'en',
        orderBy: 'relevance',
        key: API_KEY,
        fields: 'items(id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating))',
        printType: 'books'
      }
    });
    
    if (!response.data?.items) return [];
    
    const books = response.data.items
      .map(convertGoogleBook)
      .filter((book: Book | null) => 
        book !== null &&
        book.description.length > 100
      );
    
    // Store search results
    await storage.storeBooks(books);
    
    return books;
  } catch (error: any) {
    console.error('Error searching books:', error);
    throw new Error('Failed to search books');
  }
}

export async function getBookDetails(bookId: string): Promise<Book | null> {
  if (!bookId || !API_KEY) {
    return null;
  }

  try {
    // First try to get from cache
    const cachedBook = await storage.getBook(bookId);
    if (cachedBook) return cachedBook;

    // If not in cache, fetch from API
    const response = await axios.get(`${API_BASE_URL}/volumes/${bookId}`, {
      params: {
        key: API_KEY,
        fields: 'id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating)'
      }
    });
    
    if (!response.data) return null;
    
    const book = convertGoogleBook(response.data);
    if (!book) return null;
    
    // Store book details
    await storage.storeBook(book);
    
    return book;
  } catch (error: any) {
    console.error('Error getting book details:', error);
    return null;
  }
}