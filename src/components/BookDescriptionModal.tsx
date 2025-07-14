
import { X } from 'lucide-react';

interface BookDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  author: string;
  description: string;
}

export default function BookDescriptionModal({
  isOpen,
  onClose,
  title,
  author,
  description
}: BookDescriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-text">{title}</h2>
            <p className="text-text-light">by {author}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <p className="text-text leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}