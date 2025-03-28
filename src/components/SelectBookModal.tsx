import { useState } from 'react';
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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchBooks(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const filteredResults = searchResults.filter(
    (book: Book) => !excludeBooks.some(excluded => excluded.id === book.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-text mb-4">Select a Book</h2>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search for a book..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-background rounded-lg text-text"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={20} />
        </div>

        {isLoading ? (
          <LoadingIndicator message="Searching books..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredResults.map((book: Book) => (
              <button
                key={book.id}
                onClick={() => {
                  onSelect(book);
                  onClose();
                }}
                className="flex gap-4 p-4 hover:bg-accent/10 rounded-lg transition-colors text-left"
              >
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-20 h-30 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium text-text">{book.title}</h3>
                  <p className="text-text-light text-sm">{book.author}</p>
                </div>
              </button>
            ))}
            {searchQuery && filteredResults.length === 0 && (
              <p className="text-text-light col-span-2 text-center py-8">
                No books found matching your search.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
