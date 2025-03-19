import { useState, useEffect } from 'react';
import { useBookStore } from '../store/bookStore';
import { Book } from '../types/book';
import GenreSelectionModal from '../components/GenreSelectionModal';
import GenreFilter from '../components/GenreFilter';
import SwipeableBookCard from '../components/SwipeableBookCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import { Heart, X } from 'lucide-react';

export default function Home() {
  const { 
    books, 
    currentBookIndex, 
    swipeBook, 
    initializeBooks,
    isLoading,
    error 
  } = useBookStore();

  const [showGenreSelection, setShowGenreSelection] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const currentBook = books[currentBookIndex];

  useEffect(() => {
    // Check if user has already selected genres
    const storedGenres = localStorage.getItem('selectedGenres');
    if (storedGenres) {
      const genres = JSON.parse(storedGenres);
      setSelectedGenres(genres);
      setShowGenreSelection(false);
      initializeBooks(genres);
    }
  }, []);

  const handleGenreSelection = async (genres: string[]) => {
    localStorage.setItem('selectedGenres', JSON.stringify(genres));
    setSelectedGenres(genres);
    setShowGenreSelection(false);
    await initializeBooks(genres);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    swipeBook(direction === 'right');
  };

  if (isLoading) {
    return <LoadingIndicator message="Finding amazing books for you..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Oops! Something went wrong"
        message={error}
        actionLabel="Try Again"
        onAction={() => initializeBooks(selectedGenres)}
        icon="refresh"
      />
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

            {/* Swipeable card container */}
            <div className="relative h-[600px] mb-8">
              {books.slice(currentBookIndex, currentBookIndex + 1).map((book, index) => (
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
                className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors transform hover:scale-105"
              >
                <X size={30} />
              </button>
              
              <button
                onClick={() => handleSwipe('right')}
                className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors transform hover:scale-105"
              >
                <Heart size={30} />
              </button>
            </div>

            {/* Instructions */}
            <div className="text-center text-text-light text-sm">
              <p className="mb-2">Swipe right or tap the heart to like a book</p>
              <p>Swipe left or tap X to skip</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}