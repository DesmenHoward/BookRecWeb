import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <BookOpen size={60} className="text-accent mb-6" />
      <h1 className="text-4xl font-bold text-text mb-4">Page Not Found</h1>
      <p className="text-text-light mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="button">
        Go to Home
      </Link>
    </div>
  );
}