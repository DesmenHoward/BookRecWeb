import { useState, useEffect } from 'react';
import { X, Plus, Edit } from 'lucide-react';

interface BookFormData {
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  genres: string[];
  isbn?: string;
  publishedDate?: string;
}

interface AdminBookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (book: BookFormData) => void;
  editBook?: BookFormData & { id: string };
}

export default function AdminBookForm({ isOpen, onClose, onSubmit, editBook }: AdminBookFormProps) {
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    coverUrl: '',
    description: '',
    genres: [],
    isbn: '',
    publishedDate: ''
  });

  useEffect(() => {
    if (editBook) {
      setFormData({
        title: editBook.title,
        author: editBook.author,
        coverUrl: editBook.coverUrl,
        description: editBook.description,
        genres: editBook.genres,
        isbn: editBook.isbn || '',
        publishedDate: editBook.publishedDate || ''
      });
    } else {
      setFormData({
        title: '',
        author: '',
        coverUrl: '',
        description: '',
        genres: [],
        isbn: '',
        publishedDate: ''
      });
    }
  }, [editBook]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      genres: formData.genres.filter(g => g.trim() !== '')
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-surface rounded-xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {editBook ? (
              <>
                <Edit className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold text-text">Edit Book</h2>
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold text-text">Add New Book</h2>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-light rounded-lg border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-text mb-1">
              Author *
            </label>
            <input
              type="text"
              id="author"
              required
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-light rounded-lg border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="coverUrl" className="block text-sm font-medium text-text mb-1">
              Cover URL *
            </label>
            <input
              type="url"
              id="coverUrl"
              required
              value={formData.coverUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-light rounded-lg border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="genres" className="block text-sm font-medium text-text mb-1">
              Genres (comma-separated)
            </label>
            <input
              type="text"
              id="genres"
              value={formData.genres.join(', ')}
              onChange={(e) => setFormData(prev => ({ ...prev, genres: e.target.value.split(',').map(g => g.trim()) }))}
              className="w-full px-3 py-2 bg-surface-light rounded-lg border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-light rounded-lg border border-border focus:outline-none focus:border-accent min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-text mb-1">
                ISBN
              </label>
              <input
                type="text"
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light rounded-lg border border-border focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="publishedDate" className="block text-sm font-medium text-text mb-1">
                Published Date
              </label>
              <input
                type="date"
                id="publishedDate"
                value={formData.publishedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, publishedDate: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-light rounded-lg border border-border focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-light hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              {editBook ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
