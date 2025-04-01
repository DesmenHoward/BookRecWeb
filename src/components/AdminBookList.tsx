import { useState, useEffect } from 'react';
import { X, BookOpen, Trash2, Plus, Edit } from 'lucide-react';
import AdminBookForm from './AdminBookForm';

interface BookData {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  genres: string[];
  isbn?: string;
  publishedDate?: string;
}

export default function AdminBookList({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookData | null>(null);

  useEffect(() => {
    const loadStoredBooks = () => {
      try {
        const storedData = localStorage.getItem('storedBooksByGenre');
        if (!storedData) {
          setBooks([]);
          return;
        }

        const booksByGenre: Record<string, BookData[]> = JSON.parse(storedData);
        const allBooks = Array.from(
          new Map(
            Object.values(booksByGenre)
              .flat()
              .map(book => [book.id, book])
          ).values()
        );
        
        setBooks(allBooks);
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

  const removeBook = (bookId: string) => {
    try {
      const storedData = localStorage.getItem('storedBooksByGenre');
      if (!storedData) return;

      const booksByGenre: Record<string, BookData[]> = JSON.parse(storedData);
      
      Object.keys(booksByGenre).forEach(genre => {
        booksByGenre[genre] = booksByGenre[genre].filter(book => book.id !== bookId);
        if (booksByGenre[genre].length === 0) {
          delete booksByGenre[genre];
        }
      });

      localStorage.setItem('storedBooksByGenre', JSON.stringify(booksByGenre));
      setBooks(books.filter(book => book.id !== bookId));
    } catch (error) {
      console.error('Error removing book:', error);
    }
  };

  const clearAllBooks = () => {
    if (window.confirm('Are you sure you want to clear all stored books? This cannot be undone.')) {
      localStorage.removeItem('storedBooksByGenre');
      setBooks([]);
    }
  };

  const addNewBook = (bookData: Omit<BookData, 'id'>) => {
    try {
      const storedData = localStorage.getItem('storedBooksByGenre');
      const booksByGenre: Record<string, BookData[]> = storedData ? JSON.parse(storedData) : {};
      
      const newBook: BookData = {
        ...bookData,
        id: `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };

      bookData.genres.forEach(genre => {
        if (!booksByGenre[genre]) {
          booksByGenre[genre] = [];
        }
        booksByGenre[genre].push(newBook);
      });

      localStorage.setItem('storedBooksByGenre', JSON.stringify(booksByGenre));
      setBooks([...books, newBook]);
    } catch (error) {
      console.error('Error adding new book:', error);
    }
  };

  const updateBook = (bookData: Omit<BookData, 'id'>) => {
    if (!editingBook) return;
    
    try {
      const storedData = localStorage.getItem('storedBooksByGenre');
      if (!storedData) return;

      const booksByGenre: Record<string, BookData[]> = JSON.parse(storedData);
      const updatedBook: BookData = { ...bookData, id: editingBook.id };

      // Remove the old book from all genres
      Object.keys(booksByGenre).forEach(genre => {
        booksByGenre[genre] = booksByGenre[genre].filter(book => book.id !== editingBook.id);
        if (booksByGenre[genre].length === 0) {
          delete booksByGenre[genre];
        }
      });

      // Add the updated book to its new genres
      bookData.genres.forEach(genre => {
        if (!booksByGenre[genre]) {
          booksByGenre[genre] = [];
        }
        booksByGenre[genre].push(updatedBook);
      });

      localStorage.setItem('storedBooksByGenre', JSON.stringify(booksByGenre));
      setBooks(books.map(book => book.id === editingBook.id ? updatedBook : book));
      setEditingBook(null);
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-surface rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold text-text">Stored Books</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Add New Book
              </button>
              <button
                onClick={clearAllBooks}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear All Books
              </button>
              <button
                onClick={onClose}
                className="text-text-light hover:text-text transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map(book => (
                  <div
                    key={book.id}
                    className="flex bg-surface-light rounded-lg border border-border overflow-hidden group"
                  >
                    <div className="w-24 h-36 flex-shrink-0">
                      <img
                        src={book.coverUrl}
                        alt={`${book.title} cover`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 relative">
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingBook(book)}
                          className="p-1 text-accent hover:text-accent/80"
                          title="Edit book"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => removeBook(book.id)}
                          className="p-1 text-red-500 hover:text-red-600"
                          title="Remove book"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h3 className="font-semibold text-text line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-text-light mt-1">{book.author}</p>
                      {book.genres && book.genres.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {book.genres.map(genre => (
                            <span
                              key={genre}
                              className="px-2 py-0.5 bg-surface rounded text-xs text-text-light"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {books.length === 0 && (
                <div className="text-center text-text-light py-8">
                  No books stored in local storage. Books will be automatically stored here when fetched from the API.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AdminBookForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={addNewBook}
      />

      <AdminBookForm
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        onSubmit={updateBook}
        editBook={editingBook || undefined}
      />
    </>
  );
}
