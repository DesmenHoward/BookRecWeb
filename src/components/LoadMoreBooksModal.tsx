import { BookOpen, RefreshCw, X } from 'lucide-react';

interface LoadMoreBooksModalProps {
  visible: boolean;
  onLoadMore: () => void;
  onClose: () => void;
  swipeCount: number;
}

export default function LoadMoreBooksModal({ 
  visible, 
  onLoadMore, 
  onClose, 
  swipeCount 
}: LoadMoreBooksModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-lg relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-light hover:text-text transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-accent" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-text mb-2">
            Great Progress!
          </h2>

          {/* Message */}
          <p className="text-text-light mb-6 leading-relaxed">
            You've swiped through {swipeCount} books! Would you like to discover more amazing books, or take a break?
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onLoadMore}
              className="flex-1 py-3 px-6 bg-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Load More Books
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-surface text-text rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Take a Break
            </button>
          </div>

          {/* Small note */}
          <p className="text-xs text-text-light mt-4">
            We'll load 5 more books from your selected genres
          </p>
        </div>
      </div>
    </div>
  );
}
