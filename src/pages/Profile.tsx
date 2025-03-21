import { useState, useEffect } from 'react';
import { useUserProfileStore } from '../store/userProfileStore';
import { useBookStore } from '../store/bookStore';
import { Edit } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';
import EditProfileModal from '../components/EditProfileModal';
import { Book } from '../types/book';

export default function Profile() {
  const { profile, initializeProfile, isLoading } = useUserProfileStore();
  const { favorites, userNickname, addToFavorites, saveBookToStorage, searchBooks } = useBookStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    initializeProfile();
  }, []);

  const handleSearch = async () => {
    const results = await searchBooks(searchQuery);
    setSearchResults(results);
  };

  const handleAddToFavorites = (book: Book) => {
    try {
      console.log('Adding book to favorites:', book);
      addToFavorites(book);
      saveBookToStorage(book);
      console.log('Book added successfully');
    } catch (error) {
      console.error('Error adding book to favorites:', error);
    }
  };

  if (isLoading || !profile) {
    return <LoadingIndicator message="Loading profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-surface rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <img 
              src={profile.profilePicture} 
              alt={profile.displayName}
              className="w-24 h-24 rounded-full object-cover"
            />
            
            <div>
              <h1 className="text-2xl font-bold text-text">{profile.displayName}</h1>
              <p className="text-text-light">@{profile.username}</p>
              {userNickname && (
                <span className="inline-block mt-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                  {userNickname}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Edit size={20} />
            Edit Profile
          </button>
        </div>

        {profile.bio && (
          <p className="mt-6 text-text">{profile.bio}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          {profile.location && (
            <span className="text-text-light">📍 {profile.location}</span>
          )}
          {profile.socialLinks && (
            <div className="flex gap-4">
              {profile.socialLinks.twitter && (
                <a href={`https://x.com/${profile.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">X ({profile.socialLinks.twitter})</a>
              )}
              {profile.socialLinks.instagram && (
                <a href={`https://instagram.com/${profile.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Instagram ({profile.socialLinks.instagram})</a>
              )}
              {profile.socialLinks.goodreads && (
                <a href={`https://goodreads.com/user/show/${profile.socialLinks.goodreads}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Goodreads ({profile.socialLinks.goodreads})</a>
              )}
            </div>
          )}
          <span className="text-text-light">
            {profile.joinDate}
          </span>
        </div>
      </div>

      <div className="bg-surface rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-text mb-4">Favorite Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.slice(0, showAllFavorites ? favorites.length : 4).map((book) => (
            <div key={book.id} className="flex flex-col items-start mb-4">
              <img src={book.coverUrl} alt={book.title} className="w-32 h-48 object-cover rounded" />
              <h3 className="font-medium text-text mt-2">{book.title}</h3>
              <p className="text-text-light">by {book.author}</p>
              <p className="text-text-light mt-2">{book.description.slice(0, 100)}...</p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" onClick={() => setSelectedBook(book)}>
                Read More
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-4 mt-4">
          {favorites.length > 4 && (
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" onClick={() => setShowAllFavorites(!showAllFavorites)}>
              {showAllFavorites ? 'See Less' : 'See All'}
            </button>
          )}
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" onClick={() => setShowSearchModal(true)}>
            Add Book
          </button>
        </div>

        {selectedBook && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-text mb-4">{selectedBook.title}</h2>
              <p className="text-text-light">{selectedBook.description}</p>
              <button onClick={() => setSelectedBook(null)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        )}

        {showSearchModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-text mb-4">Search for Books</h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for books"
                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-accent"
              />
              <button onClick={handleSearch} className="mt-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
                Search
              </button>

              {searchResults.length > 0 && (
                <div className="mt-4">
                  {searchResults.map((book: Book) => (
                    <div key={book.id} className="flex items-center justify-between mb-2">
                      <span>{book.title} by {book.author}</span>
                      <button onClick={() => handleAddToFavorites(book)} className="px-2 py-1 bg-accent text-white rounded">Add</button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setShowSearchModal(false)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
}