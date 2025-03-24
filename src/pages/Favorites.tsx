import { useState, useEffect } from 'react';
import { useBookStore } from '../store/bookStore';
import { Heart } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import BookDescriptionModal from '../components/BookDescriptionModal';
import type { Book } from '../types/book';

export default function Favorites() {
  const { favorites, searchBooks, addToFavorites, loadUserData } = useBookStore();
  const [showAll, setShowAll] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedBook, setSelectedBook] = useState<{
    title: string;
    author: string;
    description: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load user favorites when component mounts
  useEffect(() => {
    const loadData = async () => {
      await loadUserData();
    };
    loadData();
  }, [loadUserData]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchBooks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToFavorites = async (book: Book) => {
    try {
      await addToFavorites(book);
      setSearchResults(prev => prev.filter(b => b.id !== book.id));
    } catch (error) {
      console.error('Error adding book to favorites:', error);
    }
  };

  // Ensure favorites is an array and compute displayed books
  const favoritesArray = favorites || [];
  const displayedBooks = showAll ? favoritesArray : favoritesArray.slice(0, 3);

  // Early return only if there are no favorites and no search results
  if (!favoritesArray.length && !searchResults.length) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-4">Find Your Favorite Books</h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for books to add to favorites"
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <EmptyState
          title="No Favorite Books Yet"
          message="Start discovering and liking books to add them to your favorites!"
          icon="book"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-4">Your Favorite Books</h1>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for more books to add"
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {favoritesArray.length > 3 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300 flex items-center gap-2"
            >
              {showAll ? 'See Less' : 'See All'} 
              <svg 
                className={`w-4 h-4 transform transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Favorites grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBooks.map((book) => (
            <FavoriteCard 
              key={book.id} 
              book={book}
              onShowDescription={() => {
                setSelectedBook({
                  title: book.title,
                  author: book.author,
                  description: book.description
                });
                setShowDescription(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((book) => (
              <SearchResultCard 
                key={book.id} 
                book={book} 
                onAdd={handleAddToFavorites}
              />
            ))}
          </div>
        </div>
      )}

      {selectedBook && (
        <BookDescriptionModal
          title={selectedBook.title}
          author={selectedBook.author}
          description={selectedBook.description}
          isOpen={showDescription}
          onClose={() => {
            setShowDescription(false);
            setSelectedBook(null);
          }}
        />
      )}
    </div>
  );
}

interface SearchResultCardProps {
  book: Book;
  onAdd: (book: Book) => void;
}

function SearchResultCard({ book, onAdd }: SearchResultCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-64">
        <img 
          src={book.coverUrl} 
          alt={book.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <button
          onClick={() => onAdd(book)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <Heart className="w-5 h-5 text-accent" />
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white mb-1">{book.title}</h3>
          <p className="text-white/80">by {book.author}</p>
        </div>
      </div>
    </div>
  );
}

interface FavoriteCardProps {
  book: Book;
  onShowDescription: () => void;
}

function FavoriteCard({ book, onShowDescription }: FavoriteCardProps) {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-transform"
      onClick={onShowDescription}
    >
      <div className="relative h-64">
        <img 
          src={book.coverUrl} 
          alt={book.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white mb-1">{book.title}</h3>
          <p className="text-white/80">by {book.author}</p>
        </div>
      </div>
    </div>
  );
}