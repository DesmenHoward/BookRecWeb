import { useState } from 'react';
import { searchBooks, saveBookToStorage } from '../../googleBooksApi';
import { useBookStore } from '../store/bookStore';
import { Heart, Trash2 } from 'lucide-react';

export default function Favorites() {
  const { favorites, removeFromFavorites, addToFavorites } = useBookStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    const results = await searchBooks(searchQuery);
    setSearchResults(results);
  };

  const handleAddToFavorites = (book) => {
    try {
      console.log('Adding book to favorites:', book);
      addToFavorites(book);
      saveBookToStorage(book);
      console.log('Book added successfully');
    } catch (error) {
      console.error('Error adding book to favorites:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-text mb-8">Your Favorites</h1>

      <div className="mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for books"
          className="p-2 border border-gray-300 rounded"
        />
        <button onClick={handleSearch} className="ml-2 p-2 bg-accent text-white rounded">
          Search
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {searchResults.map((book) => (
            <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-64">
                <img
                  src={book.volumeInfo.imageLinks?.thumbnail}
                  alt={book.volumeInfo.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleAddToFavorites(book)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                >
                  <Heart size={20} className="text-accent" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-text mb-1">{book.volumeInfo.title}</h3>
                <p className="text-text-light mb-3">by {book.volumeInfo.authors?.join(', ')}</p>

                <p className="text-text-light line-clamp-3">{book.volumeInfo.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h2 className="text-2xl font-bold text-text mb-4">No Favorites Yet</h2>
          <p className="text-text-light">Start discovering books to add to your favorites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((book) => (
            <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-64">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromFavorites(book.id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                >
                  <Trash2 size={20} className="text-accent" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-text mb-1">{book.title}</h3>
                <p className="text-text-light mb-3">by {book.author}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {book.genres.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full bg-accent/10 text-accent text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="text-text-light line-clamp-3">{book.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}