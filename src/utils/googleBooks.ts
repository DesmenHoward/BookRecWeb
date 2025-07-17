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

function getCoverUrl(imageLinks?: { thumbnail?: string; smallThumbnail?: string; extraLarge?: string; large?: string; medium?: string }, size: 'small' | 'medium' | 'large' = 'medium'): string {
  // More reliable default cover that clearly indicates missing image
  const defaultCover = 'https://via.placeholder.com/400x600?text=No+Cover+Available';
  
  if (!imageLinks) return defaultCover;

  // Get the best available image URL based on requested size
  let imageUrl: string | undefined;
  
  if (size === 'large') {
    imageUrl = imageLinks.extraLarge || imageLinks.large || imageLinks.thumbnail || imageLinks.smallThumbnail;
  } else if (size === 'medium') {
    imageUrl = imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail;
  } else { // small
    imageUrl = imageLinks.medium || imageLinks.smallThumbnail || imageLinks.thumbnail;
  }
  
  if (!imageUrl) return defaultCover;

  // Convert from HTTP to HTTPS if necessary
  imageUrl = imageUrl.replace(/^http:/, 'https:');

  // Remove any size modifiers
  imageUrl = imageUrl.replace(/&edge=curl/g, '')
                    .replace(/&zoom=\d+/g, '');

  // Add size modifier based on requested size
  switch (size) {
    case 'small':
      imageUrl = imageUrl.replace(/zoom=\d+/, 'zoom=1');
      break;
    case 'large':
      imageUrl = imageUrl.replace(/zoom=\d+/, 'zoom=3');
      break;
    default: // medium
      imageUrl = imageUrl.replace(/zoom=\d+/, 'zoom=2');
  }

  return imageUrl;
}

// Genre mapping for Google Books API
const GENRE_SEARCH_TERMS: Record<string, string[]> = {
  'Fiction': ['fiction'],
  'Contemporary Fiction': ['contemporary fiction', 'modern fiction'],
  'Classic Literature': ['classics', 'classic literature'],
  'Literary Fiction': ['literary fiction'],
  'Historical Fiction': ['historical fiction'],
  'Historical Romance': ['historical romance'],
  'Romance': ['romance'],
  'Science Fiction': ['science fiction', 'sci-fi'],
  'Fantasy': ['fantasy'],
  'Urban Fantasy': ['urban fantasy'],
  'Dystopian': ['dystopian', 'dystopia'],
  'Paranormal': ['paranormal', 'supernatural'],
  'Magical Realism': ['magical realism'],
  'Horror': ['horror'],
  'Mystery': ['mystery'],
  'Crime Fiction': ['crime fiction', 'crime'],
  'Thriller': ['thriller'],
  'Psychological Thriller': ['psychological thriller'],
  'Adventure': ['adventure'],
  'Western': ['western'],
  'Satire': ['satire'],
  'Steampunk': ['steampunk'],
  'Alternate History': ['alternate history', 'alternative history'],
  'Young Adult': ['young adult', 'ya'],
  'Children\'s Fiction': ['children\'s', 'juvenile fiction'],
  'Graphic Novels/Comics': ['graphic novel', 'comics'],
  'Anthology/Short Stories': ['anthology', 'short stories'],
  'Non-Fiction': ['non-fiction', 'nonfiction'],
  'Biography': ['biography', 'autobiography'],
  'True Crime': ['true crime'],
  'Travel': ['travel'],
  'Cookbooks': ['cooking', 'cookbooks', 'food'],
  'Art & Photography': ['art', 'photography'],
  'Music': ['music'],
  'Sports': ['sports'],
  'Health & Wellness': ['health', 'wellness', 'fitness'],
  'Self-Help': ['self-help'],
  'Religion & Spirituality': ['religion', 'spirituality'],
  'Poetry': ['poetry'],
  'Humor': ['humor', 'comedy']
};

export function convertGoogleBook(googleBook: GoogleBook): Book | null {
  try {
    if (!googleBook?.volumeInfo) {
      console.log('Invalid book data:', googleBook);
      return null;
    }

    const { volumeInfo } = googleBook;
    
    // Only require title, allow missing authors
    if (!volumeInfo.title) {
      console.log('Book missing title:', googleBook.id);
      return null;
    }

    // Get cover URLs for different sizes
    // Check if we have image links before trying to get cover URLs
    const hasImageLinks = volumeInfo.imageLinks && 
      (volumeInfo.imageLinks.thumbnail || 
       volumeInfo.imageLinks.smallThumbnail || 
       volumeInfo.imageLinks.large || 
       volumeInfo.imageLinks.medium || 
       volumeInfo.imageLinks.extraLarge);
    
    // Log if book is missing cover images
    if (!hasImageLinks) {
      console.log(`Book missing cover images: ${volumeInfo.title} (${googleBook.id})`);
    }
    
    const coverImages = {
      small: getCoverUrl(volumeInfo.imageLinks, 'small'),
      medium: getCoverUrl(volumeInfo.imageLinks, 'medium'),
      large: getCoverUrl(volumeInfo.imageLinks, 'large')
    };

    // Extract ISBNs from industry identifiers
    let isbn13, isbn10, isbn;
    if (volumeInfo.industryIdentifiers) {
      for (const identifier of volumeInfo.industryIdentifiers) {
        if (identifier.type === 'ISBN_13') {
          isbn13 = identifier.identifier;
          isbn = isbn13; // Prefer ISBN-13 as the general ISBN
        } else if (identifier.type === 'ISBN_10') {
          isbn10 = identifier.identifier;
          if (!isbn) isbn = isbn10; // Use ISBN-10 if ISBN-13 not available
        }
      }
    }

    // Clean description but don't validate language
    const description = cleanDescription(volumeInfo.description);

    return {
      id: googleBook.id,
      title: volumeInfo.title,
      author: volumeInfo.authors?.[0] || 'Unknown Author',
      description,
      coverUrl: coverImages.medium,
      coverImages,
      genres: volumeInfo.categories || ['Fiction'],
      publishedYear: volumeInfo.publishedDate ? 
        new Date(volumeInfo.publishedDate).getFullYear() : 
        new Date().getFullYear(),
      rating: volumeInfo.averageRating || 0,
      isbn,
      isbn13,
      isbn10
    };
  } catch (error) {
    console.error('Error converting Google Book:', error);
    return null;
  }
}

async function fetchBooksForGenre(genre: string, maxResults: number = 40): Promise<Book[]> {
  try {
    const searchTerms = GENRE_SEARCH_TERMS[genre] || [genre];
    const books: Book[] = [];
    const seenIds = new Set<string>();

    // Try each search term for the genre
    for (const term of searchTerms) {
      // Make multiple requests to get more books (20 per request)
      const requestsPerTerm = Math.ceil(maxResults / 20);
      
      for (let i = 0; i < requestsPerTerm; i++) {
        const response = await axios.get(`${API_BASE_URL}/volumes`, {
          params: {
            q: `subject:${term}`,
            maxResults: 20,
            startIndex: i * 20,
            orderBy: 'relevance',
            printType: 'books',
            langRestrict: 'en',
            key: API_KEY
          }
        });

        const items = response.data.items || [];
        
        // Convert and filter valid books
        for (const item of items) {
          const book = convertGoogleBook(item);
          if (book && !seenIds.has(book.id)) {
            books.push(book);
            seenIds.add(book.id);
          }
          
          // Break if we have enough books
          if (books.length >= maxResults) {
            break;
          }
        }
        
        // Break if we have enough books
        if (books.length >= maxResults) {
          break;
        }
      }
    }

    return books;
  } catch (error) {
    console.error(`Error fetching books for genre ${genre}:`, error);
    return [];
  }
}

export async function getInitialBookList(selectedGenres?: string[]): Promise<Book[]> {
  try {
    // If no genres specified, use a default selection
    const genres = selectedGenres?.length ? selectedGenres : Object.keys(GENRE_SEARCH_TERMS).slice(0, 5);
    
    // Fetch 20 books for each genre
    const booksPerGenre = 20;
    const allBooks: Book[] = [];
    const seenIds = new Set<string>();

    // Fetch books for each genre in parallel
    const bookPromises = genres.map(genre => fetchBooksForGenre(genre, booksPerGenre));
    const genreResults = await Promise.all(bookPromises);

    // Combine results, avoiding duplicates
    for (const books of genreResults) {
      for (const book of books) {
        if (!seenIds.has(book.id)) {
          allBooks.push(book);
          seenIds.add(book.id);
        }
      }
    }

    // Store all fetched books
    if (allBooks.length > 0) {
      await storage.storeBooks(allBooks);
    }

    return allBooks;
  } catch (error) {
    console.error('Error getting initial book list:', error);
    return [];
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
            fields: 'items(id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating,industryIdentifiers))',
            printType: 'books'
          }
        });
        
        if (response.data?.items) {
          const authorBooks = response.data.items
            .map(convertGoogleBook)
            .filter((book: Book | null): book is Book => book !== null);

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
    console.log('searchBooks: Invalid query or missing API key', { query, hasApiKey: !!API_KEY });
    return [];
  }

  try {
    console.log('searchBooks: Making API request for:', query);
    const response = await axios.get(`${API_BASE_URL}/volumes`, {
      params: {
        q: query,
        maxResults: 20,
        langRestrict: 'en',
        orderBy: 'relevance',
        key: API_KEY,
        fields: 'items(id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating,industryIdentifiers))',
        printType: 'books'
      }
    });
    
    console.log('searchBooks: Raw API response:', response.data);
    
    if (!response.data?.items) {
      console.log('searchBooks: No items in response');
      return [];
    }
    
    const books = response.data.items
      .map(convertGoogleBook)
      .filter((book: Book | null): book is Book => book !== null);
    
    console.log('searchBooks: Processed books:', books);
    
    // Store search results
    await storage.storeBooks(books);
    
    return books;
  } catch (error: any) {
    console.error('searchBooks: API Error:', error.response?.data || error.message);
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
        fields: 'id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating,industryIdentifiers)'
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