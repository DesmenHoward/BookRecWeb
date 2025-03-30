import { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { useBookStore } from '../store/bookStore';
import { Search } from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';

interface SelectBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (book: Book) => void;
  excludeBooks?: Book[];
}

export default function SelectBookModal({ isOpen, onClose, onSelect, excludeBooks = [] }: SelectBookModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const { searchBooks, isLoading } = useBookStore();

  // Reset search results when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    console.log('Starting search for:', searchQuery);
    try {
      setSearchResults([]); // Clear previous results
      const results = await searchBooks(searchQuery);
      console.log('Raw search results:', results);
      
      // Filter out books that are already in topThree
      const filteredResults = results.filter(
        (book: Book) => !excludeBooks.some(excluded => excluded.id === book.id)
      );
      
      console.log('Filtered results:', filteredResults);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-surface w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-text mb-4">Select a Book</h2>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search for a book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !(e.nativeEvent as any).isComposing) {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="flex-1 px-4 py-2 bg-background rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent"
            autoComplete="off"
          />
          <button 
            onClick={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            type="button"
            disabled={isLoading || !searchQuery.trim()}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Search size={20} />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {isLoading ? (
          <LoadingIndicator message="Searching books..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {searchResults.length > 0 ? (
              searchResults.map((book: Book) => (
                <button
                  key={book.id}
                  onClick={() => {
                    console.log('Selected book:', book);
                    onSelect(book);
                    onClose();
                  }}
                  className="flex gap-4 p-4 hover:bg-accent/10 rounded-lg transition-colors text-left"
                >
                  <img
                    src={book.coverUrl || '/placeholder-book.jpg'}
                    alt={book.title}
                    className="w-20 h-30 object-cover rounded"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/placeholder-book.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text truncate">{book.title}</h3>
                    <p className="text-text-light text-sm truncate">{book.author}</p>
                    {book.description && (
                      <p className="text-text-light text-sm mt-1 line-clamp-2">{book.description}</p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              searchQuery && !isLoading && (
                <p className="text-text-light col-span-2 text-center py-8">
                  No books found matching your search.
                </p>
              )
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
