import { useState, useEffect } from 'react';
import { BookOpen, Check, X } from 'lucide-react';

const GENRES = [
  // Fiction Categories
  'Fiction',
  'Contemporary Fiction',
  'Classic Literature',
  'Literary Fiction',
  'Historical Fiction',
  'Historical Romance',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Urban Fantasy',
  'Dystopian',
  'Paranormal',
  'Magical Realism',
  'Horror',
  'Mystery',
  'Crime Fiction',
  'Thriller',
  'Psychological Thriller',
  'Adventure',
  'Western',
  'Satire',
  'Steampunk',
  'Alternate History',
  'Young Adult',
  'Children\'s Fiction',
  'Graphic Novels/Comics',
  'Anthology/Short Stories',

  // Non-Fiction Categories
  'Non-Fiction',
  'Biography',
  'True Crime',
  'Travel',
  'Cookbooks',
  'Art & Photography',
  'Music',
  'Sports',
  'Health & Wellness',
  'Self-Help',
  'Religion & Spirituality',
  'Poetry',
  'Humor'
];

interface GenreSelectionModalProps {
  visible: boolean;
  onComplete: (selectedGenres: string[]) => void;
  onClose: () => void;
  initialGenres?: string[];
}

export default function GenreSelectionModal({ 
  visible, 
  onComplete,
  onClose,
  initialGenres = []
}: GenreSelectionModalProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
  
  useEffect(() => {
    if (visible) {
      setSelectedGenres(initialGenres);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible, initialGenres]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      }
      if (prev.length < 3) {
        return [...prev, genre];
      }
      return prev;
    });
  };

  const handleComplete = () => {
    if (selectedGenres.length === 3) {
      onComplete(selectedGenres);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        // Close modal when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-lg my-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-light hover:text-text transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <BookOpen size={48} className="text-accent mb-4 sm:mb-6" />
          <h1 className="text-2xl sm:text-3xl font-bold text-text text-center mb-2 sm:mb-3">
            {initialGenres.length > 0 ? 'Update Your Genres' : 'Welcome to BookRec'}
          </h1>
          <p className="text-text-light text-center text-sm sm:text-base">
            Select your top 3 favorite genres to get personalized book recommendations
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6 sm:mb-8 max-h-[40vh] overflow-y-auto p-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              disabled={selectedGenres.length === 3 && !selectedGenres.includes(genre)}
              className={`
                px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 transition-colors text-sm sm:text-base
                ${selectedGenres.includes(genre)
                  ? 'bg-accent border-accent text-white'
                  : 'border-border hover:border-accent'
                }
                ${selectedGenres.length === 3 && !selectedGenres.includes(genre)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
                }
              `}
            >
              {selectedGenres.includes(genre) && (
                <Check size={14} className="inline-block mr-1" />
              )}
              {genre}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-text-light mb-4 text-sm">
            {selectedGenres.length}/3 genres selected
          </p>
          
          <button
            onClick={handleComplete}
            disabled={selectedGenres.length !== 3}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold text-white text-sm sm:text-base
              ${selectedGenres.length === 3
                ? 'bg-accent hover:opacity-90'
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            {initialGenres.length > 0 ? 'Update Genres' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}