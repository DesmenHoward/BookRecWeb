import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '../store/bookStore';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { useUserProfileStore } from '../store/userProfileStore';
import { Book } from '../types/book';
import { Search } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';

export default function Reviews() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { searchBooks } = useBookStore();
  const { reviews, allUserReviews, getBookReviews, getUserReviews, addReview, updateReview, deleteReview, editingReviewId, setEditingReviewId, isLoading } = useReviewStore();
  const { user } = useAuthStore();
  const { profile, initializeProfile } = useUserProfileStore();
  const navigate = useNavigate();

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // Load user's reviews and profile when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      getUserReviews(user.uid);
      initializeProfile();
    }
  }, [user?.uid, getUserReviews, initializeProfile]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setError(null);
    
    try {
      const results = await searchBooks(searchQuery);
      setSearchResults(results);
      setSelectedBook(null);
    } catch (err) {
      setError('Failed to search for books. Please try again.');
    }
  };

  const handleBookSelect = useCallback(async (book: Book) => {
    setSelectedBook(book);
    setError(null);
    try {
      await getBookReviews(book.id);
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
    }
    // Reset review form
    setRating(0);
    setReviewText('');
  }, [getBookReviews]);

  const handleSubmitReview = async () => {
    if (!user || !selectedBook || !profile) return;
    if (!rating || !reviewText.trim()) {
      setError('Please provide both a rating and review text.');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    try {
      // Ensure we have a display name from the profile
      const displayName = profile.displayName || "Anonymous";
      
      await addReview({
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        userId: user.uid,
        userName: displayName, // Use profile's display name
        rating,
        text: reviewText.trim()
      });
      
      // Refresh the reviews after adding
      await getBookReviews(selectedBook.id);
      
      // Reset form
      setRating(0);
      setReviewText('');
      setError(null);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="bg-surface rounded-lg sm:rounded-xl p-3 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text mb-4 sm:mb-6">Book Reviews</h1>
        
        {/* Error Message */}
        {error && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-1 sm:gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a book..."
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              onClick={handleSearch}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* My Reviews Section */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-text mb-3 sm:mb-4">My Reviews</h2>
          {allUserReviews.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {allUserReviews.map((review) => (
                <div key={review.id} className="p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-text text-sm sm:text-base">{review.bookTitle}</h3>
                      <div className="text-text-light text-xs sm:text-sm">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <span className="ml-2">By: <button 
                          onClick={() => handleProfileClick(review.userId)}
                          className="text-accent hover:underline focus:outline-none"
                        >
                          {review.userName}
                        </button></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-base sm:text-lg ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {user?.uid === review.userId && (
                        <div className="flex gap-1 sm:gap-2">
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
                              className="text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingReviewId(review.id || null)}
                              className="text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (review.id && window.confirm('Are you sure you want to delete this review?')) {
                                await deleteReview(review.id);
                                await getUserReviews(user.uid);
                              }
                            }}
                            className="text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {editingReviewId === review.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 sm:gap-2">
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
                    <p className="mt-2">{review.text}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-light">You have not written any reviews yet.</p>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && !selectedBook && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-text mb-4">Search Results</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {searchResults.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleBookSelect(book)}
                  className="flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <img
                    src={book.coverImages.medium}
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-text">{book.title}</h3>
                    <p className="text-text-light text-sm">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Book Reviews */}
        {selectedBook && (
          <div className="mt-8">
            <button
              onClick={() => setSelectedBook(null)}
              className="text-accent hover:text-accent/80 mb-4"
            >
              ← Back to search results
            </button>

            <div className="flex gap-6 mb-6">
              <img
                src={selectedBook.coverImages.large}
                alt={selectedBook.title}
                className="w-32 h-44 object-cover rounded-lg shadow-md"
              />
              <div>
                <h2 className="text-xl font-semibold text-text">{selectedBook.title}</h2>
                <p className="text-text-light">{selectedBook.author}</p>
              </div>
            </div>

            {isLoading ? (
              <LoadingIndicator message="Loading reviews..." />
            ) : (
              <>
                {/* Review Form */}
                {user ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h3 className="text-lg font-semibold text-text mb-4">
                      {reviews.length === 0 ? 'Be the first to review this book!' : 'Write a Review'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={`text-2xl transition-colors ${
                                star <= rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Review</label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your thoughts about this book..."
                          className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[100px]"
                        />
                      </div>
                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmitting || rating === 0 || !reviewText.trim()}
                        className="w-full px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-light">
                      Please sign in to write a review.
                    </p>
                  </div>
                )}

                {/* Book Reviews */}
                {reviews.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-text">Reviews</h3>
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-text-light">
                              <span>By: <button 
                                onClick={() => handleProfileClick(review.userId)}
                                className="text-accent hover:underline focus:outline-none"
                              >
                                {review.userName}
                              </button></span>
                              <span className="text-sm ml-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
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
                        </div>
                        <p className="text-text">{review.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
