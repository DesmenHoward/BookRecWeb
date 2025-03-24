import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUserProfileStore } from '../store/userProfileStore';
import { useBookStore } from '../store/bookStore';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { Edit } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';
import EditProfileModal from '../components/EditProfileModal';
import { Book } from '../types/book';

export default function Profile() {
  const { userId } = useParams();
  const { profile, initializeProfile, isLoading } = useUserProfileStore();
  const { favorites, userNickname, addToFavorites, saveBookToStorage, searchBooks } = useBookStore();
  const { allUserReviews, getUserReviews, updateReview, deleteReview, editingReviewId, setEditingReviewId } = useReviewStore();
  const { user } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    if (userId) {
      // If viewing another user's profile
      getUserReviews(userId);
    } else if (user?.uid) {
      // If viewing own profile
      initializeProfile();
      getUserReviews(user.uid);
    }
  }, [userId, user?.uid, initializeProfile, getUserReviews]);

  if (isLoading || !profile) {
    return <LoadingIndicator message="Loading profile..." />;
  }

  const isOwnProfile = !userId || userId === user?.uid;

  const displayedReviews = showAllReviews ? allUserReviews : allUserReviews.slice(0, 3);

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
              {userNickname && isOwnProfile && (
                <span className="inline-block mt-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                  {userNickname}
                </span>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              <Edit size={20} />
              Edit Profile
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="mt-6 text-text">{profile.bio}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          {profile.location && (
            <span className="text-text-light"> {profile.location}</span>
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
              {isOwnProfile && (
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" onClick={() => setSelectedBook(book)}>
                  Read More
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex space-x-4 mt-4">
          {favorites.length > 4 && (
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" onClick={() => setShowAllFavorites(!showAllFavorites)}>
              {showAllFavorites ? 'See Less' : 'See All'}
            </button>
          )}
          {isOwnProfile && (
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" onClick={() => setShowSearchModal(true)}>
              Add Book
            </button>
          )}
        </div>
      </div>

      {/* My Reviews Section */}
      <div className="bg-surface rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-text mb-4">My Reviews</h2>
        {allUserReviews.length > 0 ? (
          <>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {displayedReviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-text">{review.bookTitle}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {isOwnProfile && (
                        <div className="flex gap-2">
                          {editingReviewId === review.id ? (
                            <button
                              onClick={async () => {
                                if (review.id) {
                                  await updateReview(review.id, {
                                    rating: review.rating,
                                    text: review.text
                                  });
                                  setEditingReviewId(null);
                                }
                              }}
                              className="text-sm px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingReviewId(review.id || null)}
                              className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (review.id && window.confirm('Are you sure you want to delete this review?')) {
                                await deleteReview(review.id, review.bookId, user.uid);
                                await getUserReviews(user.uid);
                              }
                            }}
                            className="text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-text-light mb-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  {editingReviewId === review.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-text-light">Rating:</label>
                        <select
                          value={review.rating}
                          onChange={(e) => {
                            const updatedReviews = allUserReviews.map((r) =>
                              r.id === review.id ? { ...r, rating: Number(e.target.value) } : r
                            );
                            useReviewStore.setState({ allUserReviews: updatedReviews });
                          }}
                          className="border rounded p-1"
                        >
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <option key={rating} value={rating}>
                              {rating}
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        value={review.text}
                        onChange={(e) => {
                          const updatedReviews = allUserReviews.map((r) =>
                            r.id === review.id ? { ...r, text: e.target.value } : r
                          );
                          useReviewStore.setState({ allUserReviews: updatedReviews });
                        }}
                        className="w-full p-2 border rounded"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <p className="text-text">{review.text}</p>
                  )}
                </div>
              ))}
            </div>
            {allUserReviews.length > 3 && (
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? 'Show Less' : `Show All (${allUserReviews.length})`}
              </button>
            )}
          </>
        ) : (
          <p className="text-text-light">You haven't written any reviews yet.</p>
        )}
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

      {isOwnProfile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}