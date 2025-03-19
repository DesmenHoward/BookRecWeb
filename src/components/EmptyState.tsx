import { BookOpen, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'book' | 'refresh';
}

export default function EmptyState({ 
  title, 
  message, 
  actionLabel, 
  onAction,
  icon = 'book'
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="w-16 h-16 mb-6 text-accent">
        {icon === 'book' ? <BookOpen size={64} /> : <RefreshCw size={64} />}
      </div>
      <h2 className="text-2xl font-bold text-text mb-4">{title}</h2>
      <p className="text-text-light mb-8">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}