import { useState } from 'react';
import { Book } from '../types/book';
import { Heart } from 'lucide-react';

interface BookCardProps {
  book: Book;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
  onFavoriteToggle?: () => void;
}

export default function BookCard({ 
  book, 
  isFavorite = false, 
  showFavoriteButton = false,
  onFavoriteToggle
}: BookCardProps) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div className="relative w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-96">
        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-[12px] bg-gray-200 shadow-inner z-10" />
        
        {/* Main cover */}
        <div className="absolute inset-0 ml-[12px]">
          <img 
            src={book.coverImages.large || book.coverUrl} 
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // Try large cover if it's not already being used
              if (img.src !== book.coverImages.large && book.coverImages.large) {
                img.src = book.coverImages.large;
              }
              // Try medium size if large fails
              else if (img.src === book.coverImages.large) {
                img.src = book.coverImages.medium;
              }
              // Try small size if medium fails
              else if (img.src === book.coverImages.medium) {
                img.src = book.coverImages.small;
              }
              // If all sizes fail, use a guaranteed fallback
              else if (img.src === book.coverImages.small) {
                // Use a reliable placeholder service as final fallback
                img.src = `https://via.placeholder.com/400x600?text=${encodeURIComponent(book.title)}`;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        {/* Page edge effect */}
        <div className="absolute right-0 top-0 bottom-0 w-[20px] bg-gradient-to-l from-white via-gray-100 to-gray-200 transform skew-y-[45deg] origin-top-right" />
        
        {/* Bookmark */}
        <div className="absolute -right-2 top-4 w-[24px] h-[60px] bg-accent transform -rotate-12 z-20 shadow-md" />
        
        {showFavoriteButton && (
          <button
            onClick={onFavoriteToggle}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-colors z-30"
          >
            <Heart 
              size={24} 
              className={isFavorite ? 'text-accent fill-accent' : 'text-gray-600'} 
            />
          </button>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
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