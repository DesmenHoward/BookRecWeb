import { useState, useEffect } from 'react';
import { useBookStore } from '../store/bookStore';
import GenreSelectionModal from '../components/GenreSelectionModal';
import GenreFilter from '../components/GenreFilter';
import SwipeableBookCard from '../components/SwipeableBookCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import LoadMoreBooksModal from '../components/LoadMoreBooksModal';
import { Heart, X } from 'lucide-react';

export default function Home() {
  const { 
    books, 
    currentBookIndex, 
    swipeBook, 
    loadNext5Books,
    initializeBooks,
    initializeTrendingBooks,
    swipesSinceLastLoad,
    isLoading,
    error 
  } = useBookStore();

  const [showGenreSelection, setShowGenreSelection] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showLoadMoreModal, setShowLoadMoreModal] = useState(false);
  const currentBook = books[currentBookIndex];

  useEffect(() => {
    // Check if user has already selected genres
    const storedGenres = localStorage.getItem('selectedGenres');
    if (storedGenres) {
      const genres = JSON.parse(storedGenres);
      setSelectedGenres(genres);
      setShowGenreSelection(false);
      initializeBooks(genres);
    } else {
      // If no genres are selected, use default genres to ensure books are loaded
      const defaultGenres = ['Fiction', 'Mystery', 'Science Fiction'];
      initializeBooks(defaultGenres);
    }
  }, []);

  useEffect(() => {
    // Show load more modal exactly at 15 swipes, not after
    if (swipesSinceLastLoad === 15 && !showLoadMoreModal && !showGenreSelection && currentBook) {
      setShowLoadMoreModal(true);
    }
  }, [swipesSinceLastLoad, showLoadMoreModal, showGenreSelection, currentBook]);

  const handleGenreSelection = async (genres: string[]) => {
    localStorage.setItem('selectedGenres', JSON.stringify(genres));
    setSelectedGenres(genres);
    setShowGenreSelection(false);
    await initializeBooks(genres);
  };

  const handleSurpriseMe = async () => {
    localStorage.setItem('selectedGenres', JSON.stringify(['trending']));
    setSelectedGenres(['trending']);
    setShowGenreSelection(false);
    await initializeTrendingBooks();
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    swipeBook(direction === 'right');
  };

  const handleLoadMoreBooks = async () => {
    try {
      setShowLoadMoreModal(false);
      await loadNext5Books();
    } catch (error) {
      console.error('Error loading more books:', error);
      setShowLoadMoreModal(false);
    }
  };

  const handleSkipLoadMore = () => {
    setShowLoadMoreModal(false);
    // User can continue with remaining books
  };

  if (isLoading) {
    return <LoadingIndicator message="Finding amazing books for you..." />;
  }

  if (error) {
    return (
      <>
        <GenreFilter 
          onOpenGenreSelection={() => setShowGenreSelection(true)}
          selectedGenres={selectedGenres}
        />
        <EmptyState
          title="Oops! Something went wrong"
          message={error}
          actionLabel="Try Again"
          onAction={() => initializeBooks(selectedGenres)}
          icon="refresh"
        />
      </>
    );
  }

  if (!currentBook && !showGenreSelection) {
    return (
      <>
        <GenreFilter 
          onOpenGenreSelection={() => setShowGenreSelection(true)}
          selectedGenres={selectedGenres}
        />
        <EmptyState
          title="No More Books"
          message="Check back later for more recommendations!"
          icon="book"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showGenreSelection ? (
        <GenreSelectionModal
          visible={true}
          onComplete={handleGenreSelection}
          onSurpriseMe={handleSurpriseMe}
          onClose={() => setShowGenreSelection(false)}
          initialGenres={selectedGenres}
        />
      ) : (
        <>
          <GenreFilter 
            onOpenGenreSelection={() => setShowGenreSelection(true)}
            selectedGenres={selectedGenres}
          />

          <div className="max-w-xl mx-auto px-4">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-text-light text-sm mb-2">
                <span>Books Viewed: {currentBookIndex}</span>
                <span>Remaining: {books.length - currentBookIndex}</span>
              </div>
              <div className="h-1 bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${(currentBookIndex / books.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center text-text-light text-sm mb-4">
              Swipe right or tap the heart to like a book. Swipe left or tap X to skip.
            </div>

            {/* Swipeable card container */}
            <div className="relative h-[500px] sm:h-[600px] w-[85%] sm:w-full mx-auto mb-8">
              {books.slice(currentBookIndex, currentBookIndex + 1).map(book => (
                <SwipeableBookCard
                  key={book.id}
                  book={book}
                  onSwipe={handleSwipe}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-6 pb-8">
              <button
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors transform hover:scale-105 active:scale-95"
                disabled={isLoading}
              >
                <X size={30} />
              </button>
              
              <button
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors transform hover:scale-105 active:scale-95"
                disabled={isLoading}
              >
                <Heart size={30} />
              </button>
            </div>
          </div>

          {/* Load More Books Modal */}
          <LoadMoreBooksModal
            visible={showLoadMoreModal}
            onLoadMore={handleLoadMoreBooks}
            onClose={handleSkipLoadMore}
            swipeCount={swipesSinceLastLoad}
          />
        </>
      )}
    </div>
  );
}