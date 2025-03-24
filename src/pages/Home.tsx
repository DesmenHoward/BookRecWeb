import { useState, useEffect, useRef } from 'react';
import { useBookStore } from '../store/bookStore';
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
    loadMoreBooks,
    initializeBooks,
    isLoading,
    error 
  } = useBookStore();

  const [showGenreSelection, setShowGenreSelection] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (books.length - currentBookIndex <= 5 && !isLoading) {
      loadMoreBooks();
    }
  }, [currentBookIndex, books.length]);

  const handleGenreSelection = async (genres: string[]) => {
    localStorage.setItem('selectedGenres', JSON.stringify(genres));
    setSelectedGenres(genres);
    setShowGenreSelection(false);
    await initializeBooks(genres);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    swipeBook(direction === 'right');
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if ('touches' in e) {
      setDragStartX(e.touches[0].clientX);
    } else {
      setDragStartX(e.clientX);
    }
  };

  const handleDragMove = (e: React.DragEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !cardRef.current) return;

    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - dragStartX;
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    cardRef.current.style.opacity = `${1 - Math.abs(deltaX) / 500}`;
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !cardRef.current) return;

    const currentX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = currentX - dragStartX;
    
    if (Math.abs(deltaX) > 100) {
      // Swipe threshold met
      handleSwipe(deltaX > 0 ? 'right' : 'left');
    }

    // Reset card position
    cardRef.current.style.transform = 'none';
    cardRef.current.style.opacity = '1';
    setIsDragging(false);
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

            {/* Instructions */}
            <div className="text-center text-text-light text-sm mb-4">
              Swipe right or tap the heart to like a book. Swipe left or tap X to skip.
            </div>

            {/* Swipeable card container */}
            <div className="relative h-[600px] mb-8">
              {books.slice(currentBookIndex, currentBookIndex + 1).map(book => (
                <div
                  key={book.id}
                  ref={cardRef}
                  draggable
                  onDragStart={handleDragStart}
                  onDrag={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                  className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing transition-transform"
                >
                  <SwipeableBookCard
                    book={book}
                    onSwipe={handleSwipe}
                  />
                </div>
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
          </div>
        </>
      )}
    </div>
  );
}