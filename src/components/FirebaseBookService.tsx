import { useFirebaseStore } from '../store/firebaseStore';
import { Book } from '../types/book';

// Interface for book data in Firestore
export interface FirestoreBook {
  id?: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  genres: string[];
  publishedYear: number;
  rating?: number;
  status?: 'already-read' | 'read-later' | 'not-interested' | null;
}

// Collection name for books in Firestore
const BOOKS_COLLECTION = 'books';
const USER_BOOKS_COLLECTION = 'userBooks';
const FAVORITES_COLLECTION = 'favorites';

// Hook for book operations with Firebase
export function useFirebaseBookService() {
  const { 
    addDocument, 
    getDocuments, 
    getDocument, 
    updateDocument, 
    deleteDocument,
    queryDocuments,
    user
  } = useFirebaseStore();

  // Get all books
  const getAllBooks = async (): Promise<Book[]> => {
    try {
      const books = await getDocuments<FirestoreBook>(BOOKS_COLLECTION);
      return books.map(book => ({
        ...book,
        id: book.id || `book-${Date.now()}`,
      }));
    } catch (error) {
      console.error('Error getting books:', error);
      throw error;
    }
  };

  // Get a single book by ID
  const getBookById = async (bookId: string): Promise<Book | null> => {
    try {
      const book = await getDocument<FirestoreBook>(BOOKS_COLLECTION, bookId);
      if (!book) return null;
      
      return {
        ...book,
        id: book.id || bookId,
      };
    } catch (error) {
      console.error(`Error getting book ${bookId}:`, error);
      throw error;
    }
  };

  // Add a book to user's favorites
  const addToFavorites = async (book: Book): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Create a user-book relationship
      await addDocument(FAVORITES_COLLECTION, {
        userId: user.uid,
        bookId: book.id,
        addedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding book to favorites:', error);
      throw error;
    }
  };

  // Remove a book from user's favorites
  const removeFromFavorites = async (bookId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Find the favorite document
      const favorites = await queryDocuments(
        FAVORITES_COLLECTION, 
        'userId', 
        '==', 
        user.uid
      );
      
      const favoriteToDelete = favorites.find((fav: any) => fav.bookId === bookId);
      
      if (favoriteToDelete) {
        await deleteDocument(FAVORITES_COLLECTION, favoriteToDelete.id);
      }
    } catch (error) {
      console.error('Error removing book from favorites:', error);
      throw error;
    }
  };

  // Get user's favorite books
  const getFavoriteBooks = async (): Promise<Book[]> => {
    if (!user) return [];
    
    try {
      // Get all favorites for the user
      const favorites = await queryDocuments<{bookId: string}>(
        FAVORITES_COLLECTION, 
        'userId', 
        '==', 
        user.uid
      );
      
      // Get the actual book data for each favorite
      const bookIds = favorites.map(fav => fav.bookId);
      const books: Book[] = [];
      
      for (const bookId of bookIds) {
        const book = await getBookById(bookId);
        if (book) books.push(book);
      }
      
      return books;
    } catch (error) {
      console.error('Error getting favorite books:', error);
      throw error;
    }
  };

  // Update book status (already-read, read-later, not-interested)
  const updateBookStatus = async (
    bookId: string, 
    status: 'already-read' | 'read-later' | 'not-interested' | null
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Check if user-book relationship exists
      const userBooks = await queryDocuments(
        USER_BOOKS_COLLECTION,
        'userId',
        '==',
        user.uid
      );
      
      const userBook = userBooks.find((ub: any) => ub.bookId === bookId);
      
      if (userBook) {
        // Update existing relationship
        await updateDocument(USER_BOOKS_COLLECTION, userBook.id, { status });
      } else {
        // Create new relationship
        await addDocument(USER_BOOKS_COLLECTION, {
          userId: user.uid,
          bookId,
          status,
          updatedAt: new Date().toISOString()
        });
      }
      
      // If status is read-later, also add to favorites
      if (status === 'read-later') {
        const book = await getBookById(bookId);
        if (book) {
          // Check if already in favorites
          const favorites = await queryDocuments(
            FAVORITES_COLLECTION,
            'userId',
            '==',
            user.uid
          );
          
          const isAlreadyFavorite = favorites.some((fav: any) => fav.bookId === bookId);
          
          if (!isAlreadyFavorite) {
            await addToFavorites(book);
          }
        }
      }
    } catch (error) {
      console.error(`Error updating book status for ${bookId}:`, error);
      throw error;
    }
  };

  return {
    getAllBooks,
    getBookById,
    addToFavorites,
    removeFromFavorites,
    getFavoriteBooks,
    updateBookStatus
  };
}