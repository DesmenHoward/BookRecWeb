import { useState } from 'react';
import { Book } from '../types/book';
import { Heart } from 'lucide-react';

interface BookCardProps {
  book: Book;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
  showActionButtons?: boolean;
  onFavoriteToggle?: () => void;
}

export default function BookCard({ 
  book, 
  isFavorite = false, 
  showFavoriteButton = false,
  showActionButtons = false,
  onFavoriteToggle
}: BookCardProps) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="relative w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-96">
        <img 
          src={book.coverUrl} 
          alt={book.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {showFavoriteButton && (
          <button
            onClick={onFavoriteToggle}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
          >
            <Heart 
              size={24} 
              className={isFavorite ? 'text-accent fill-accent' : 'text-gray-600'} 
            />
          </button>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {book.genres.slice(0, 3).map((genre, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs font-medium text-white bg-accent/60 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-1">{book.title}</h3>
          <p className="text-sm text-white/80">by {book.author}</p>
          
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="mt-2 text-sm text-accent underline"
          >
            {showDescription ? 'Hide Description' : 'Show Description'}
          </button>
          
          {showDescription && (
            <p className="mt-2 text-sm text-white/90 line-clamp-3">
              {book.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}