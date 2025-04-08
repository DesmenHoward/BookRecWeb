import { useState } from 'react';
import { Mountain, Plus, X, Search } from 'lucide-react';
import { useBookStore } from '../store/bookStore';

interface MountRushmoreBooksProps {
  mountRushmoreBooks?: any[];
  onUpdateMountRushmore: (books: any[]) => void;
}

export default function MountRushmoreBooks({ 
  mountRushmoreBooks = [null, null, null, null], 
  onUpdateMountRushmore 
}: MountRushmoreBooksProps) {
  const [selectBookModalVisible, setSelectBookModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const { favorites } = useBookStore();

  const handleSelectBook = (position: number) => {
    setSelectedPosition(position);
    setSelectBookModalVisible(true);
  };

  const handleBookSelected = (book: any) => {
    if (selectedPosition === null) return;

    // Check if book is already in Mount Rushmore
    if (mountRushmoreBooks.some(b => b?.id === book.id)) {
      alert('This book is already in your Mount Rushmore. Please choose another book.');
      return;
    }

    const newBooks = [...mountRushmoreBooks];
    newBooks[selectedPosition] = book;
    onUpdateMountRushmore(newBooks);
    setSelectBookModalVisible(false);
    setSelectedPosition(null);
  };

  const handleRemoveBook = (position: number) => {
    if (confirm('Are you sure you want to remove this book from your Mount Rushmore?')) {
      const newBooks = [...mountRushmoreBooks];
      newBooks[position] = null;
      onUpdateMountRushmore(newBooks);
    }
  };

  const renderBookSlot = (position: number) => {
    const book = mountRushmoreBooks[position];

    return (
      <div className="relative mb-4">
        {!book ? (
          <button 
            className="flex flex-col items-center justify-center w-full h-40 bg-white rounded-lg border-2 border-dashed border-accent p-4 hover:bg-gray-50 transition-colors"
            onClick={() => handleSelectBook(position)}
          >
            <Plus className="w-6 h-6 text-accent mb-2" />
            <span className="text-sm text-textLight">Add Book</span>
          </button>
        ) : (
          <div className="flex bg-white rounded-lg overflow-hidden h-40">
            <img src={book.coverUrl} alt={book.title} className="w-28 h-40 object-cover" />
            <div className="flex-1 p-4">
              <h3 className="text-sm font-bold text-text line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-xs text-textLight line-clamp-1">{book.author}</p>
            </div>
            <button 
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
              onClick={() => handleRemoveBook(position)}
            >
              <X className="w-4 h-4 text-accent" />
            </button>
          </div>
        )}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">{position + 1}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-xl p-6 mt-4 mx-4 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Mountain className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold text-text">Mount Rushmore</h2>
        </div>
        <p className="text-sm text-textLight">Your all-time favorite books</p>
      </div>

      <div className="space-y-4">
        {[0, 1, 2, 3].map((position) => (
          <div key={position}>
            {renderBookSlot(position)}
          </div>
        ))}
      </div>

      {selectBookModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden">
            <div className="bg-accent p-4 flex items-center justify-between">
              <button 
                onClick={() => setSelectBookModalVisible(false)}
                className="text-white hover:opacity-80"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold text-white">Select Book</h2>
              <div className="w-6" /> {/* Spacer for alignment */}
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-textLight text-center">
                    Add some books to your favorites first
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((item) => (
                    <button 
                      key={item.id}
                      className="flex items-center w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => handleBookSelected(item)}
                    >
                      <img src={item.coverUrl} alt={item.title} className="w-16 h-24 object-cover rounded" />
                      <div className="ml-4">
                        <h3 className="font-medium text-text">{item.title}</h3>
                        <p className="text-sm text-textLight">{item.author}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}