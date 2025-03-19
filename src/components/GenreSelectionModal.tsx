import { useState, useEffect } from 'react';
import { BookOpen, Check } from 'lucide-react';

const GENRES = [
  'Fiction',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Historical Fiction',
  'Literary Fiction',
  'Horror',
  'Young Adult',
  'Biography',
  'Non-Fiction',
  'Poetry',
  'Self-Help',
  'Adventure'
];

interface GenreSelectionModalProps {
  visible: boolean;
  onComplete: (selectedGenres: string[]) => void;
  initialGenres?: string[];
}

export default function GenreSelectionModal({ 
  visible, 
  onComplete,
  initialGenres = []
}: GenreSelectionModalProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
  
  useEffect(() => {
    if (visible) {
      setSelectedGenres(initialGenres);
    }
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
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <BookOpen size={64} className="text-accent mb-6" />
          <h1 className="text-3xl font-bold text-text text-center mb-3">
            {initialGenres.length > 0 ? 'Update Your Genres' : 'Welcome to Book Tinder'}
          </h1>
          <p className="text-text-light text-center">
            Select your top 3 favorite genres to get personalized book recommendations
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              disabled={selectedGenres.length === 3 && !selectedGenres.includes(genre)}
              className={`
                px-4 py-2 rounded-full border-2 transition-colors
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
                <Check size={16} className="inline-block mr-1" />
              )}
              {genre}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-text-light mb-4">
            {selectedGenres.length}/3 genres selected
          </p>
          
          <button
            onClick={handleComplete}
            disabled={selectedGenres.length !== 3}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold text-white
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