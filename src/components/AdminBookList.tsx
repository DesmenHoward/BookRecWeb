import { useState, useEffect } from 'react';
import { X, BookOpen, Trash2, Plus, Edit2, Search } from 'lucide-react';
import { STORAGE_KEYS } from '../utils/bookStorage';
import { Book } from '../types/book';
import AdminBookForm from './AdminBookForm';

interface AdminBookListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminBookList({ isOpen, onClose }: AdminBookListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadStoredBooks = () => {
      try {
        // Get all books from storage
        const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
        if (!storedBooks) {
          setBooks([]);
          return;
        }

        const allBooks: Book[] = JSON.parse(storedBooks);
        
        // Sort books by title
        const sortedBooks = allBooks.sort((a, b) => a.title.localeCompare(b.title));
        setBooks(sortedBooks);
      } catch (error) {
        console.error('Error loading stored books:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadStoredBooks();
    }
  }, [isOpen]);

  const filteredBooks = books.filter(book => {
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genres?.some(genre => genre.toLowerCase().includes(query)) ||
      book.description?.toLowerCase().includes(query) ||
      book.isbn?.toLowerCase().includes(query)
    );
  });

  const addNewBook = async (formData: { title: string; author: string; coverUrl: string; description: string; genres: string[]; isbn?: string; publishedDate?: string }) => {
    try {
      // Get current books
      const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      const allBooks: Book[] = storedBooks ? JSON.parse(storedBooks) : [];
      
      // Create new book with unique ID
      const newBook: Book = {
        ...formData,
        id: `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        coverImages: {
          small: formData.coverUrl,
          medium: formData.coverUrl,
          large: formData.coverUrl
        },
        publishedYear: formData.publishedDate ? new Date(formData.publishedDate).getFullYear() : new Date().getFullYear(),
        coverUrl: formData.coverUrl
      };
      
      // Add to main book storage
      const updatedBooks = [...allBooks, newBook];
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
      
      // Add to genre mapping
      if (formData.genres?.length) {
        const genreMapping = localStorage.getItem(STORAGE_KEYS.GENRE_BOOKS);
        const genreData = genreMapping ? JSON.parse(genreMapping) : {};
        
        formData.genres.forEach(genre => {
          if (!genreData[genre]) {
            genreData[genre] = { bookIds: [], lastUpdated: Date.now() };
          }
          genreData[genre].bookIds.push(newBook.id);
          genreData[genre].lastUpdated = Date.now();
        });
        
        localStorage.setItem(STORAGE_KEYS.GENRE_BOOKS, JSON.stringify(genreData));
      }
      
      // Update state
      setBooks(updatedBooks.sort((a, b) => a.title.localeCompare(b.title)));
    } catch (error) {
      console.error('Error adding new book:', error);
    }
  };

  const editBook = async (formData: { title: string; author: string; coverUrl: string; description: string; genres: string[]; isbn?: string; publishedDate?: string }) => {
    if (!editingBook) return;

    try {
      // Get current books
      const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      if (!storedBooks) return;

      const allBooks: Book[] = JSON.parse(storedBooks);
      const bookIndex = allBooks.findIndex(book => book.id === editingBook.id);
      
      if (bookIndex === -1) return;

      // Update book data
      const updatedBook: Book = {
        ...allBooks[bookIndex],
        ...formData,
        coverImages: {
          small: formData.coverUrl,
          medium: formData.coverUrl,
          large: formData.coverUrl
        },
        publishedYear: formData.publishedDate ? new Date(formData.publishedDate).getFullYear() : allBooks[bookIndex].publishedYear,
        coverUrl: formData.coverUrl
      };

      // Update main book storage
      allBooks[bookIndex] = updatedBook;
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(allBooks));

      // Update genre mapping
      const genreMapping = localStorage.getItem(STORAGE_KEYS.GENRE_BOOKS);
      if (genreMapping) {
        const genreData = JSON.parse(genreMapping);
        
        // Remove book from old genres
        Object.keys(genreData).forEach(genre => {
          genreData[genre].bookIds = genreData[genre].bookIds.filter((id: string) => id !== editingBook.id);
        });

        // Add book to new genres
        if (formData.genres?.length) {
          formData.genres.forEach(genre => {
            if (!genreData[genre]) {
              genreData[genre] = { bookIds: [], lastUpdated: Date.now() };
            }
            genreData[genre].bookIds.push(editingBook.id);
            genreData[genre].lastUpdated = Date.now();
          });
        }

        localStorage.setItem(STORAGE_KEYS.GENRE_BOOKS, JSON.stringify(genreData));
      }

      // Update state
      setBooks(allBooks.sort((a, b) => a.title.localeCompare(b.title)));
      setEditingBook(null);
    } catch (error) {
      console.error('Error editing book:', error);
    }
  };

  const removeBook = async (bookId: string) => {
    try {
      // Get current books
      const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      if (!storedBooks) return;

      const allBooks: Book[] = JSON.parse(storedBooks);
      const updatedBooks = allBooks.filter(book => book.id !== bookId);
      
      // Update main book storage
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updatedBooks));
      
      // Update genre mapping
      const genreMapping = localStorage.getItem(STORAGE_KEYS.GENRE_BOOKS);
      if (genreMapping) {
        const genreData = JSON.parse(genreMapping);
        Object.keys(genreData).forEach(genre => {
          genreData[genre].bookIds = genreData[genre].bookIds.filter((id: string) => id !== bookId);
        });
        localStorage.setItem(STORAGE_KEYS.GENRE_BOOKS, JSON.stringify(genreData));
      }

      setBooks(updatedBooks);
    } catch (error) {
      console.error('Error removing book:', error);
    }
  };

  const clearAllBooks = () => {
    if (window.confirm('Are you sure you want to clear all stored books? This cannot be undone.')) {
      // Clear all book-related storage
      localStorage.removeItem(STORAGE_KEYS.BOOKS);
      localStorage.removeItem(STORAGE_KEYS.GENRE_BOOKS);
      localStorage.removeItem(STORAGE_KEYS.GENRE_META);
      localStorage.removeItem(STORAGE_KEYS.CACHE_TIMESTAMP);
      setBooks([]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-surface rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold text-text">Stored Books</h2>
              <span className="text-text-light">({filteredBooks.length} of {books.length})</span>
            </div>
            <button
              onClick={onClose}
              className="text-text-light hover:text-text transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-text-light">Loading books...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearAllBooks}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear All Books
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search books by title, author, genre..."
                      className="w-full px-4 py-2 pl-10 bg-surface-light rounded-lg focus:ring-1 focus:ring-accent placeholder:text-text-light/50"
                    />
                    <Search className="w-4 h-4 text-text-light absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} />
                    Add Book
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBooks.map(book => (
                    <div key={book.id} className="bg-surface-light p-4 rounded-lg flex gap-4">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-20 h-28 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-text">{book.title}</h3>
                        <p className="text-text-light text-sm">{book.author}</p>
                        <p className="text-text-light text-sm mt-1">
                          {book.genres?.join(', ') || 'No genres'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => setEditingBook(book)}
                            className="text-accent hover:text-accent/90 transition-colors text-sm flex items-center gap-1"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => removeBook(book.id)}
                            className="text-red-500 hover:text-red-600 transition-colors text-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredBooks.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-text-light">
                      {searchQuery ? 'No books match your search' : 'No books stored yet'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <AdminBookForm
        isOpen={showAddForm || editingBook !== null}
        onClose={() => {
          setShowAddForm(false);
          setEditingBook(null);
        }}
        onSubmit={editingBook ? editBook : addNewBook}
        editBook={editingBook ? {
          ...editingBook,
          coverUrl: editingBook.coverUrl,
          publishedDate: editingBook.publishedYear ? `${editingBook.publishedYear}-01-01` : undefined
        } : undefined}
      />
    </>
  );
}
