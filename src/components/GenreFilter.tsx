
import { Filter } from 'lucide-react';

interface GenreFilterProps {
  onOpenGenreSelection: () => void;
  selectedGenres: string[];
}

export default function GenreFilter({ onOpenGenreSelection, selectedGenres }: GenreFilterProps) {
  return (
    <div className="bg-surface shadow-sm py-4 px-4 sm:px-6 mb-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        <h1 className="text-lg sm:text-2xl font-bold text-text">Discover Books</h1>
        
        <button
          onClick={onOpenGenreSelection}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors whitespace-nowrap text-sm sm:text-base"
        >
          <Filter size={18} className="sm:w-5 sm:h-5" />
          <span>Filter</span>
        </button>
      </div>

      {selectedGenres.length > 0 && (
        <div className="max-w-6xl mx-auto mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {selectedGenres.map(genre => (
            <span
              key={genre}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-accent/10 text-accent rounded-full text-xs sm:text-sm font-medium"
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}