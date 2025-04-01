import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUserProfileStore } from '../store/userProfileStore';
import { useBookStore } from '../store/bookStore';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { Edit, Crown, Settings, Shield } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';
import EditProfileModal from '../components/EditProfileModal';
import AccountSettingsModal from '../components/AccountSettingsModal';
import AdminModal from '../components/AdminModal';
import SelectBookModal from '../components/SelectBookModal';
import { Book } from '../types/book';
import ShopButton from '../components/ShopButton';

export default function Profile() {
  const { userId } = useParams();
  const { profile, initializeProfile, isLoading: profileLoading } = useUserProfileStore();
  const { 
    topThree, 
    userNickname, 
    updateTopThree, 
    loadUserData, 
    loadOtherUserData, 
    isLoading: bookLoading 
  } = useBookStore();
  const { allUserReviews, getUserReviews, updateReview, deleteReview, editingReviewId, setEditingReviewId } = useReviewStore();
  const { user } = useAuthStore();
  const { isAdmin } = useAdminStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showSelectBookModal, setShowSelectBookModal] = useState(false);

  // Load profile and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (userId) {
          // If viewing another user's profile
          await Promise.all([
            getUserReviews(userId),
            loadOtherUserData(userId)
          ]);
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
  }, [userId, user?.uid, initializeProfile, loadUserData, loadOtherUserData, getUserReviews]);

  const handleAddBook = async (book: Book) => {
    if (!user) {
      return; // Should never happen as the button is only shown to logged-in users
    }
    
    if (topThree.length >= 3) {
      return;
    }
    
    try {
      const updatedTopThree = [...topThree, book];
      await updateTopThree(updatedTopThree);
    } catch (error) {
      console.error('Error adding book to top three:', error);
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
        <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <img
              src={profile.profilePicture || defaultProfilePicture}
              alt={`${profile.displayName}'s profile`}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
            />
            
            <div className="flex-1 space-y-2 md:space-y-0">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold text-text">{profile.displayName}</h1>
                <p className="text-sm md:text-base text-text-light">@{profile.username}</p>
                {userNickname && isOwnProfile && (
                  <span className="inline-block mt-1 md:mt-2 px-2 md:px-3 py-0.5 md:py-1 bg-accent/10 text-accent rounded-full text-xs md:text-sm">
                    {userNickname}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <div className="flex flex-row md:flex-col justify-center gap-2 md:gap-2 mt-2 md:mt-0 w-[40%] md:w-auto mx-auto md:mx-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1 md:gap-2 px-1.5 py-1.5 md:px-4 md:py-2 bg-accent text-white rounded-md md:rounded-lg hover:bg-accent/90 transition-colors text-xs md:text-base min-w-[80px]"
              >
                <Edit size={14} className="md:w-5 md:h-5" />
                <span className="hidden md:inline">Edit Profile</span>
                <span className="inline md:hidden">Edit</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1 md:gap-2 px-1.5 py-1.5 md:px-4 md:py-2 bg-gray-200 text-gray-800 rounded-md md:rounded-lg hover:bg-gray-300 transition-colors text-xs md:text-base min-w-[80px]"
              >
                <Settings size={14} className="md:w-5 md:h-5" />
                <span className="hidden md:inline">Account Settings</span>
                <span className="inline md:hidden">Settings</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-1 md:gap-2 px-1.5 py-1.5 md:px-4 md:py-2 bg-green-500 text-white rounded-md md:rounded-lg hover:bg-green-600 transition-colors text-xs md:text-base min-w-[80px]"
                >
                  <Shield size={14} className="md:w-5 md:h-5" />
                  <span className="hidden md:inline">Admin Panel</span>
                  <span className="inline md:hidden">Admin</span>
                </button>
              )}
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="mt-6 text-text text-center md:text-left">{profile.bio}</p>
        )}

        <div className="mt-6 flex flex-col md:flex-row items-center md:items-start gap-4">
          {profile.location && (
            <span className="text-text-light text-center"> {profile.location}</span>
          )}
          {profile.socialLinks && (
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
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
              onClick={() => setShowSelectBookModal(true)}
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
                onClick={() => setShowSelectBookModal(true)}
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
                      onClick={() => updateTopThree(topThree.filter(b => b.id !== book.id))}
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

      {showEditModal && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showSettingsModal && (
        <AccountSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showAdminModal && (
        <AdminModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {showSelectBookModal && (
        <SelectBookModal
          isOpen={showSelectBookModal}
          onClose={() => setShowSelectBookModal(false)}
          onSelect={handleAddBook}
          excludeBooks={topThree}
        />
      )}
    </div>
  );
}