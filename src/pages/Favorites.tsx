import { useState, useEffect } from 'react';
import { searchBooks, saveBookToStorage } from '../../googleBooksApi';
import type { Book } from '../../googleBooksApi';
import { useBookStore } from '../store/bookStore';
import { Heart, Trash2 } from 'lucide-react';

export default function Favorites() {
  const { favorites, removeFromFavorites, addToFavorites, loadUserData } = useBookStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites when component mounts
  useEffect(() => {
    loadUserData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await searchBooks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setIsLoading(false);
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

  const handleRemoveFromFavorites = async (bookId: string) => {
    try {
      await removeFromFavorites(bookId);
    } catch (error) {
      console.error('Error removing book from favorites:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-text mb-8">Your Favorites</h1>

      <div className="mb-8">
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
            disabled={isLoading}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((book) => (
              <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <img
                    src={book.volumeInfo.imageLinks?.thumbnail}
                    alt={book.volumeInfo.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleAddToFavorites(book)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-accent" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{book.volumeInfo.title}</h3>
                  <p className="text-gray-600 text-sm">{book.volumeInfo.authors?.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Favorite Books</h2>
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't added any favorites yet. Use the search above to find books you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((book) => (
              <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFromFavorites(book.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                  <p className="text-gray-600 text-sm">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}