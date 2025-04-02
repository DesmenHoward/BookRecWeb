import { Book } from '../types/book';
import { useBookStore } from '../store/bookStore';
import { X } from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';

interface SelectBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (book: Book) => void;
  excludeBooks?: Book[];
}

export default function SelectBookModal({ isOpen, onClose, onSelect, excludeBooks = [] }: SelectBookModalProps) {
  const { favorites, isLoading } = useBookStore();

  // Filter favorites to exclude books already in top three
  const availableFavorites = favorites?.filter(
    (book: Book) => !excludeBooks.some(excluded => excluded.id === book.id)
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-surface w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text">Add from Your Favorites</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading ? (
            <LoadingIndicator message="Loading favorites..." />
          ) : availableFavorites.length > 0 ? (
            availableFavorites.map((book: Book) => (
              <button
                key={book.id}
                onClick={() => {
                  console.log('Selected favorite book:', book);
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
            <p className="text-text-light col-span-2 text-center py-8">
              No favorite books available to add. Books already in your top 3 are excluded.
            </p>
          )}
        </div>

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
