import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUserProfileStore } from '../store/userProfileStore';
import { useBookStore } from '../store/bookStore';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { Edit, Crown } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';
import EditProfileModal from '../components/EditProfileModal';
import { Book } from '../types/book';
import ShopButton from '../components/ShopButton';

export default function Profile() {
  const { userId } = useParams();
  const { profile, initializeProfile, isLoading: profileLoading } = useUserProfileStore();
  const { topThree, userNickname, updateTopThree, searchBooks, loadUserData, isLoading: bookLoading } = useBookStore();
  const { allUserReviews, getUserReviews, updateReview, deleteReview, editingReviewId, setEditingReviewId } = useReviewStore();
  const { user } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Load profile and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (userId) {
          // If viewing another user's profile
          getUserReviews(userId);
        } else if (user?.uid) {
          // If viewing own profile
          await Promise.all([
            initializeProfile(),
            loadUserData(),
            getUserReviews(user.uid)
          ]);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };
    loadData();
  }, [userId, user?.uid, initializeProfile, loadUserData, getUserReviews]);

  const handleSearchModal = async () => {
    if (!searchQuery.trim()) return;
    const results = await searchBooks(searchQuery);
    setSearchResults(results);
  };

  const handleAddToTopThree = async (book: Book) => {
    try {
      const newTopThree = [...topThree, book];
      if (newTopThree.length > 3) {
        newTopThree.shift(); // Remove oldest book if adding a 4th
      }
      await updateTopThree(newTopThree);
      setShowSearchModal(false);
    } catch (error) {
      console.error('Error updating top three:', error);
    }
  };

  const handleRemoveFromTopThree = async (bookId: string) => {
    try {
      const newTopThree = topThree.filter(b => b.id !== bookId);
      await updateTopThree(newTopThree);
    } catch (error) {
      console.error('Error removing book from top three:', error);
    }
  };

  if (profileLoading || bookLoading || !profile) {
    return <LoadingIndicator message="Loading profile..." />;
  }

  const isOwnProfile = !userId || userId === user?.uid;

  const displayedReviews = showAllReviews ? allUserReviews : allUserReviews.slice(0, 3);

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Top 3 All-Time Favorites
          </h2>
          {isOwnProfile && topThree.length < 3 && (
            <button 
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              onClick={() => setShowSearchModal(true)}
            >
              Add Book
            </button>
          )}
        </div>

        {topThree.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-light mb-4">Share your all-time favorite books with your followers!</p>
            {isOwnProfile && (
              <button 
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                onClick={() => setShowSearchModal(true)}
              >
                Add Your First Top Book
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {topThree.map((book, index) => (
              <div key={book.id} className="flex flex-col items-center">
                <div className="relative">
                  <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-48 h-72 object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold shadow-lg">
                    #{index + 1}
                  </div>
                </div>
                <h3 className="font-medium text-text mt-4 text-center">{book.title}</h3>
                <p className="text-text-light text-center">by {book.author}</p>
                <div className="flex flex-col w-full gap-2 mt-4">
                  <ShopButton book={book} className="w-full" />
                  {isOwnProfile && (
                    <button 
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      onClick={() => handleRemoveFromTopThree(book.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add to Top 3</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchModal()}
                placeholder="Search for books"
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button 
                onClick={handleSearchModal}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
              >
                Search
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((book) => (
                  <div key={book.id} className="flex items-center gap-4 p-2 border rounded">
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{book.title}</h3>
                      <p className="text-sm text-text-light">by {book.author}</p>
                    </div>
                    <button
                      onClick={() => handleAddToTopThree(book)}
                      className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
                      disabled={topThree.some(b => b.id === book.id)}
                    >
                      {topThree.some(b => b.id === book.id) ? 'Added' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowSearchModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
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