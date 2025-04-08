import { BookOpen, Clock, X } from 'lucide-react';
import { Book } from '../types/book';
import { useBookStore } from '../store/bookStore';

interface BookActionButtonsProps {
  book: Book;
}

export default function BookActionButtons({ book }: BookActionButtonsProps) {
  const { updateBookStatus } = useBookStore();
  
  const handleAlreadyRead = () => {
    updateBookStatus(book.id, 'already-read');
  };
  
  const handleReadLater = () => {
    updateBookStatus(book.id, 'read');
  };
  
  const handleNotInterested = () => {
    updateBookStatus(book.id, 'not-interested');
  };
  
  // If the book already has a status, show that status
  if (book.status) {
    return (
      <div className="flex items-center justify-center p-2 rounded-lg">
        <div className={`
          flex items-center px-3 py-1 rounded-full text-white
          ${book.status === 'already-read' ? 'bg-success' : ''}
          ${book.status === 'read' ? 'bg-warning' : ''}
          ${book.status === 'not-interested' ? 'bg-error' : ''}
        `}>
          {book.status === 'already-read' && <BookOpen size={16} className="mr-1" />}
          {book.status === 'read' && <Clock size={16} className="mr-1" />}
          {book.status === 'not-interested' && <X size={16} className="mr-1" />}
          <span className="text-sm">
            {book.status === 'already-read' ? 'Read' : 
             book.status === 'read' ? 'Read Later' : 
             'Not Interested'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-4 mb-1">
      <button
        onClick={handleAlreadyRead}
        className="flex items-center justify-center px-4 py-2 rounded-lg bg-success text-white hover:bg-success/90 transition-colors"
      >
        <BookOpen size={16} className="mr-2" />
        <span>Already Read</span>
      </button>
      
      <button
        onClick={handleReadLater}
        className="flex items-center justify-center px-4 py-2 rounded-lg bg-warning text-white hover:bg-warning/90 transition-colors"
      >
        <Clock size={16} className="mr-2" />
        <span>Read Later</span>
      </button>
      
      <button
        onClick={handleNotInterested}
        className="flex items-center justify-center px-4 py-2 rounded-lg bg-error text-white hover:bg-error/90 transition-colors"
      >
        <X size={16} className="mr-2" />
        <span>Not Interested</span>
      </button>
    </div>
  );
}