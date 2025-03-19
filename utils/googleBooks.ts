import axios from 'axios';
import { GoogleBook, Book } from '../types/book';
import * as BookStorage from './bookStorage';

const API_BASE_URL = 'https://www.googleapis.com/books/v1';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

// Helper function to get a valid cover URL
function getCoverUrl(imageLinks?: { thumbnail?: string; smallThumbnail?: string }): string {
  if (!imageLinks) return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  
  try {
    // Replace http with https and zoom parameter for higher quality
    const secureUrl = (url: string) => 
      url.replace('http://', 'https://')
         .replace('zoom=1', 'zoom=2')
         .replace('&edge=curl', '');
    
    if (imageLinks.thumbnail) {
      return secureUrl(imageLinks.thumbnail);
    }
    
    if (imageLinks.smallThumbnail) {
      return secureUrl(imageLinks.smallThumbnail);
    }
  } catch (error) {
    console.error('Error processing cover URL:', error);
  }
  
  return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
}

// Convert Google Books volume to our Book format
function convertGoogleBook(googleBook: GoogleBook): Book | null {
  try {
    if (!googleBook?.volumeInfo) return null;

    const { volumeInfo } = googleBook;
    
    // Skip books without essential information
    if (!volumeInfo.title || !volumeInfo.authors?.length) {
      return null;
    }

    return {
      id: googleBook.id,
      title: volumeInfo.title,
      author: volumeInfo.authors[0],
      description: volumeInfo.description || 'No description available.',
      coverUrl: getCoverUrl(volumeInfo.imageLinks),
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

// Get initial book list for discovery
export async function getInitialBookList(selectedGenres?: string[]): Promise<Book[]> {
  if (!API_KEY) {
    throw new Error('Google Books API key is not configured');
  }

  try {
    // Build query based on selected genres
    let query = '';
    if (selectedGenres?.length) {
      // Create a more flexible query that will return more results
      query = selectedGenres
        .map(genre => `(subject:${genre} OR genre:${genre})`)
        .join(' OR ');
    } else {
      // Default query for popular fiction books
      query = 'subject:fiction';
    }

    // Add additional filters to get better quality results
    query += ' AND (ratings>50 OR reviews>20)';

    // Fetch books from API with expanded fields
    const response = await axios.get(`${API_BASE_URL}/volumes`, {
      params: {
        q: query,
        maxResults: 40, // Request more books to account for filtering
        langRestrict: 'en',
        orderBy: 'relevance',
        key: API_KEY,
        fields: 'items(id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating))',
        printType: 'books'
      }
    });

    if (!response.data?.items?.length) {
      // If no results with specific genres, try a broader search
      const fallbackResponse = await axios.get(`${API_BASE_URL}/volumes`, {
        params: {
          q: 'subject:fiction',
          maxResults: 40,
          langRestrict: 'en',
          orderBy: 'relevance',
          key: API_KEY,
          fields: 'items(id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating))',
          printType: 'books'
        }
      });
      
      if (!fallbackResponse.data?.items?.length) {
        throw new Error('No books found from API');
      }
      
      response.data = fallbackResponse.data;
    }

    // Convert and filter valid books
    const books = response.data.items
      .map(convertGoogleBook)
      .filter((book): book is Book => 
        book !== null && 
        book.genres.length > 0
      );

    if (books.length === 0) {
      throw new Error('No valid books found after filtering');
    }

    // Store books in local storage
    await BookStorage.storeBooks(books);

    // Return shuffled books
    return [...books].sort(() => Math.random() - 0.5);
  } catch (error: any) {
    console.error('Error fetching books from API:', error.response?.data || error.message);
    
    // Try to get books from storage as fallback
    const storedBooks = await BookStorage.getAllBooks({ genres: selectedGenres });
    if (storedBooks.length > 0) {
      return storedBooks;
    }
    
    throw new Error('Failed to fetch books from API and no stored books available');
  }
}

// Get book recommendations based on user preferences
export async function getBookRecommendations(likedBooks: Book[]): Promise<Book[]> {
  if (!likedBooks?.length || !API_KEY) {
    return [];
  }

  try {
    const likedAuthors = [...new Set(likedBooks.map(book => book.author))];
    const likedGenres = [...new Set(likedBooks.flatMap(book => book.genres))];
    const recommendations: Book[] = [];
    
    // Fetch books by the same authors
    for (const author of likedAuthors) {
      const response = await axios.get(`${API_BASE_URL}/volumes`, {
        params: {
          q: `inauthor:"${author}" subject:(${likedGenres.join(' OR ')})`,
          maxResults: 10,
          langRestrict: 'en',
          orderBy: 'relevance',
          key: API_KEY,
          fields: 'items(id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating))',
          filter: 'ebooks',
          printType: 'books'
        }
      });
      
      if (response.data?.items) {
        const authorBooks = response.data.items
          .map(convertGoogleBook)
          .filter((book): book is Book => 
            book !== null &&
            !likedBooks.some(liked => liked.id === book.id) &&
            !recommendations.some(rec => rec.id === book.id) &&
            book.description.length > 100 &&
            book.genres.some(g => likedGenres.includes(g))
          );
        
        recommendations.push(...authorBooks);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    
    // If we need more recommendations, fetch by genres
    if (recommendations.length < 20) {
      for (const genre of likedGenres) {
        const response = await axios.get(`${API_BASE_URL}/volumes`, {
          params: {
            q: `subject:"${genre}"`,
            maxResults: 10,
            langRestrict: 'en',
            orderBy: 'relevance',
            key: API_KEY,
            fields: 'items(id,volumeInfo(title,authors,description,categories,publishedDate,imageLinks,averageRating))',
            filter: 'ebooks',
            printType: 'books'
          }
        });
        
        if (response.data?.items) {
          const genreBooks = response.data.items
            .map(convertGoogleBook)
            .filter((book): book is Book => 
              book !== null &&
              !likedBooks.some(liked => liked.id === book.id) &&
              !recommendations.some(rec => rec.id === book.id) &&
              book.description.length > 100 &&
              book.genres.includes(genre)
            );
          
          recommendations.push(...genreBooks);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }
    
    // Store recommendations
    await BookStorage.storeBooks(recommendations);
    
    // Return shuffled, unique recommendations
    return [...new Set(recommendations)]
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
  } catch (error: any) {
    console.error('Error getting recommendations:', error.response?.data || error.message);
    throw new Error('Failed to fetch book recommendations');
  }
}

// Search books
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
        filter: 'ebooks',
        printType: 'books'
      }
    });
    
    if (!response.data?.items) return [];
    
    const books = response.data.items
      .map(convertGoogleBook)
      .filter((book): book is Book => 
        book !== null &&
        book.description.length > 100
      );
    
    // Store search results
    await BookStorage.storeBooks(books);
    
    return books;
  } catch (error: any) {
    console.error('Error searching books:', error.response?.data || error.message);
    throw new Error('Failed to search books');
  }
}

// Get book details
export async function getBookDetails(bookId: string): Promise<Book | null> {
  if (!bookId || !API_KEY) {
    return null;
  }

  try {
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
    await BookStorage.storeBook(book);
    
    return book;
  } catch (error: any) {
    console.error('Error getting book details:', error.response?.data || error.message);
    return null;
  }
}

export { getInitialBookList, getBookRecommendations, searchBooks, getBookDetails }