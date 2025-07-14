import { useFirebaseStore } from '../store/firebaseStore';
import { useAuthStore } from '../store/authStore';
import { Book } from '../types/book';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/config';

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
  reviewCount?: number;
  coverImages?: {
    small: string;
    medium: string;
    large: string;
  };
}

// Collection name for books in Firestore
const BOOKS_COLLECTION = 'books';
const USER_BOOKS_COLLECTION = 'userBooks';
const FAVORITES_COLLECTION = 'favorites';

// Hook for book operations with Firebase
export function useFirebaseBookService() {
  const { 
    getDocument, 
    setDocument, 
    updateDocument, 
    deleteDocument 
  } = useFirebaseStore();
  
  // Get user from auth store
  const { user } = useAuthStore();

  const convertFirestoreToBook = (firestoreBook: FirestoreBook): Book => {
    return {
      id: firestoreBook.id || '',
      title: firestoreBook.title,
      author: firestoreBook.author,
      description: firestoreBook.description,
      coverUrl: firestoreBook.coverUrl,
      genres: firestoreBook.genres || [],
      rating: firestoreBook.rating || 0,
      reviewCount: firestoreBook.reviewCount || 0,
      publishedYear: firestoreBook.publishedYear || new Date().getFullYear(),
      coverImages: firestoreBook.coverImages || {
        small: firestoreBook.coverUrl,
        medium: firestoreBook.coverUrl,
        large: firestoreBook.coverUrl
      }
    };
  };

  // Get all books
  const getAllBooks = async (): Promise<Book[]> => {
    try {
      const booksRef = collection(firestore, BOOKS_COLLECTION);
      const querySnapshot = await getDocs(booksRef);
      
      const books: Book[] = [];
      querySnapshot.forEach((doc) => {
        const bookData = doc.data() as FirestoreBook;
        books.push(convertFirestoreToBook({
          ...bookData,
          id: doc.id
        }));
      });
      
      return books;
    } catch (error) {
      console.error('Error getting books:', error);
      throw error;
    }
  };

  // Get a single book by ID
  const getBookById = async (bookId: string): Promise<Book | null> => {
    try {
      const book = await getDocument(BOOKS_COLLECTION, bookId);
      return book ? convertFirestoreToBook({...book, id: bookId} as FirestoreBook) : null;
    } catch (error) {
      console.error(`Error getting book ${bookId}:`, error);
      throw error;
    }
  };

  // Add a book to user's favorites
  const addToFavorites = async (book: Book): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Create a user-book relationship with a unique document ID
      const favoriteId = `${user.uid}_${book.id}`;
      await setDocument(FAVORITES_COLLECTION, favoriteId, {
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
      // With the unique document ID format, we can directly delete
      const favoriteId = `${user.uid}_${bookId}`;
      await deleteDocument(FAVORITES_COLLECTION, favoriteId);
    } catch (error) {
      console.error('Error removing book from favorites:', error);
      throw error;
    }
  };

  // Get user's favorite books
  const getFavoriteBooks = async (): Promise<Book[]> => {
    if (!user) return [];
    
    try {
      // Query favorites collection for user's favorites
      const favoritesRef = collection(firestore, FAVORITES_COLLECTION);
      const q = query(favoritesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      // Get the actual book data for each favorite
      const books: Book[] = [];
      const bookPromises = querySnapshot.docs.map(async (doc) => {
        const favoriteData = doc.data();
        const book = await getBookById(favoriteData.bookId);
        if (book) books.push(book);
      });
      
      await Promise.all(bookPromises);
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
      // With a consistent ID format, we can directly update or create
      const userBookId = `${user.uid}_${bookId}`;
      
      // Try to get the document first
      const existingUserBook = await getDocument(USER_BOOKS_COLLECTION, userBookId);
      
      if (existingUserBook) {
        // Update existing relationship
        await updateDocument(USER_BOOKS_COLLECTION, userBookId, { status });
      } else {
        // Create new relationship
        await setDocument(USER_BOOKS_COLLECTION, userBookId, {
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
          const favoriteId = `${user.uid}_${bookId}`;
          const existingFavorite = await getDocument(FAVORITES_COLLECTION, favoriteId);
          
          if (!existingFavorite) {
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