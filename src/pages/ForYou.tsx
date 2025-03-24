import { useEffect, useState } from 'react';
import { useBookStore } from '../store/bookStore';
import { Heart, BookOpen, X } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import BookDescriptionModal from '../components/BookDescriptionModal';
import ShopButton from '../components/ShopButton';

export default function ForYou() {
  const { 
    recommendations, 
    generateRecommendations, 
    isLoading, 
    swipedBooks = [],
    updateBookStatus 
  } = useBookStore();

  const [selectedBook, setSelectedBook] = useState<{
    title: string;
    author: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (swipedBooks.length > 0) {
      generateRecommendations(5);
    }
  }, [swipedBooks]);

  if (!swipedBooks || swipedBooks.length === 0) {
    return (
      <EmptyState
        title="No Recommendations Yet"
        message="Start discovering and liking books to get personalized recommendations!"
        icon="book"
      />
    );
  }

  if (isLoading) {
    return <LoadingIndicator message="Finding books you'll love..." />;
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <EmptyState
        title="Building Your Recommendations"
        message="Like more books to get better recommendations"
        icon="book"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-text mb-8">Recommended For You</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.slice(0, 5).map(book => (
          <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-64">
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{book.title}</h3>
                <p className="text-white/80">by {book.author}</p>
              </div>
            </div>
            
            <div className="p-4">
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
              
              <div className="mb-4">
                <p className="text-text-light line-clamp-3">{book.description}</p>
                <button
                  onClick={() => setSelectedBook({
                    title: book.title,
                    author: book.author,
                    description: book.description
                  })}
                  className="text-sm text-accent hover:text-accent/80 transition-colors mt-2"
                >
                  Read More
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <ShopButton book={book} className="w-full" />
                
                <button
                  onClick={() => updateBookStatus(book.id, 'read')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    book.status === 'read'
                      ? 'bg-green-500 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <BookOpen size={18} />
                  Want to Read
                </button>

                <button
                  onClick={() => updateBookStatus(book.id, 'already-read')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    book.status === 'already-read'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <Heart size={18} />
                  Already Read
                </button>

                <button
                  onClick={() => updateBookStatus(book.id, 'not-interested')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    book.status === 'not-interested'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  <X size={18} />
                  Not Interested
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BookDescriptionModal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        title={selectedBook?.title || ''}
        author={selectedBook?.author || ''}
        description={selectedBook?.description || ''}
      />
    </div>
  );
}