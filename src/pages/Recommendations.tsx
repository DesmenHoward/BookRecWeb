import { useBookStore } from '../store/bookStore';
import { Heart } from 'lucide-react';

export default function Recommendations() {
  const { recommendations, addToFavorites, removeFromFavorites, favorites } = useBookStore();

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="text-2xl font-bold text-text mb-4">No Recommendations Yet</h2>
        <p className="text-text-light">
          Keep swiping on books to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-text mb-8">Your Recommendations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map(book => {
          const isFavorite = favorites.some(fav => fav.id === book.id);
          
          return (
            <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-64">
                <img 
                  src={book.coverUrl} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => isFavorite ? removeFromFavorites(book.id) : addToFavorites(book)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                >
                  <Heart 
                    size={20} 
                    className={`${isFavorite ? 'text-accent fill-accent' : 'text-text-light'}`} 
                  />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-text mb-1">{book.title}</h3>
                <p className="text-text-light mb-3">by {book.author}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {book.genres.slice(0, 3).map((genre, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 rounded-full bg-accent/10 text-accent text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                <p className="text-text-light line-clamp-3">{book.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}