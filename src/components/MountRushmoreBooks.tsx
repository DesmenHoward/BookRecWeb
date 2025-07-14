
import { Mountain, Plus, X } from 'lucide-react';
import { useBookStore } from '../store/bookStore';

interface MountRushmoreBooksProps {
  selectedBooks: (string | null)[];
  onUpdateBooks: (books: (string | null)[]) => void;
}

export default function MountRushmoreBooks({ 
  selectedBooks = [null, null, null, null], 
  onUpdateBooks 
}: MountRushmoreBooksProps) {
  const { favorites } = useBookStore();

  const handleSelectBook = (position: number) => {
    const availableBooks = favorites.filter(book => !selectedBooks.includes(book.id));
    if (availableBooks.length === 0) {
      alert('Please add some books to your favorites first.');
      return;
    }

    const book = availableBooks[0];
    const newBooks = [...selectedBooks];
    newBooks[position] = book.id;
    onUpdateBooks(newBooks);
  };

  const handleRemoveBook = (position: number) => {
    if (confirm('Are you sure you want to remove this book from your Mount Rushmore?')) {
      const newBooks = [...selectedBooks];
      newBooks[position] = null;
      onUpdateBooks(newBooks);
    }
  };

  const renderBookSlot = (position: number) => {
    const bookId = selectedBooks[position];
    const book = bookId ? favorites.find(f => f.id === bookId) : null;

    return (
      <div className="relative mb-4">
        {!bookId ? (
          <button 
            className="flex flex-col items-center justify-center w-full h-40 bg-white rounded-lg border-2 border-dashed border-accent p-4 hover:bg-gray-50 transition-colors"
            onClick={() => handleSelectBook(position)}
          >
            <Plus className="w-8 h-8 text-accent mb-2" />
            <span className="text-sm text-textLight">Add Book</span>
          </button>
        ) : (
          <div className="flex bg-white rounded-lg overflow-hidden h-40">
            {book && (
              <img src={book.coverUrl} alt={book.title} className="w-28 h-40 object-cover" />
            )}
            <div className="flex-1 p-4">
              {book && (
                <>
                  <h3 className="text-sm font-bold text-text line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-xs text-textLight line-clamp-1">{book.author}</p>
                </>
              )}
            </div>
            <button 
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
              onClick={() => handleRemoveBook(position)}
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((position) => (
        <div key={position} className="relative">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2">
            <Mountain className="w-5 h-5 text-accent" />
          </div>
          {renderBookSlot(position)}
        </div>
      ))}
    </div>
  );
}