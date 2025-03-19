import React from 'react';
import { Filter } from 'lucide-react';

interface GenreFilterProps {
  onOpenGenreSelection: () => void;
  selectedGenres: string[];
}

export default function GenreFilter({ onOpenGenreSelection, selectedGenres }: GenreFilterProps) {
  return (
    <div className="bg-surface shadow-sm py-4 px-6 mb-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Discover Books</h1>
        
        <button
          onClick={onOpenGenreSelection}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Filter size={20} />
          <span>Filter Genres</span>
        </button>
      </div>

      {selectedGenres.length > 0 && (
        <div className="max-w-6xl mx-auto mt-4 flex flex-wrap gap-2">
          {selectedGenres.map(genre => (
            <span
              key={genre}
              className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}