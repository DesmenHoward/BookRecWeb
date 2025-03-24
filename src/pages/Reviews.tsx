import { useState } from 'react';
import { useBookStore } from '../store/bookStore';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
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
  const { searchBooks } = useBookStore();
  const { reviews, getBookReviews, addReview, isLoading } = useReviewStore();
  const { user } = useAuthStore();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const results = await searchBooks(searchQuery);
    setSearchResults(results);
    setSelectedBook(null);
  };

  const handleBookSelect = async (book: Book) => {
    setSelectedBook(book);
    await getBookReviews(book.id);
    // Reset review form
    setRating(0);
    setReviewText('');
  };

  const handleSubmitReview = async () => {
    if (!user || !selectedBook) return;
    
    setIsSubmitting(true);
    try {
      await addReview({
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        text: reviewText
      });
      // Reset form
      setRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userReviews = reviews.filter(review => review.userId === user.uid);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-surface rounded-xl p-6">
        <h1 className="text-2xl font-bold text-text mb-6">Book Reviews</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a book to read or write reviews..."
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* My Reviews Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-text mb-4">My Reviews</h2>
          {userReviews.length > 0 ? (
            <div className="space-y-4">
              {userReviews.map((review) => (
                <div key={review.id} className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-text">{review.bookTitle}</h3>
                  <p className="text-text-light text-sm">Rating: {review.rating}</p>
                  <p>{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-light">You have not written any reviews yet.</p>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && !selectedBook && (
          <div className="space-y-4">
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
          <div>
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
                {reviews.length > 0 && (
                  <div className="space-y-6 mb-8">
                    <h3 className="text-lg font-semibold text-text">Reviews</h3>
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-text">{review.userName}</span>
                            <span className="text-text-light text-sm ml-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
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

                {/* Review Form */}
                {user ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
