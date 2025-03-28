import { Link, useLocation } from 'react-router-dom';
import { Heart, User, Sparkles, MessageSquare, BookOpen } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navigation() {
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link to="/" className="text-2xl font-bold text-accent flex items-center gap-2">
          <img src="/favicon.PNG" alt="BookRec Logo" className="w-12 h-12 rounded-lg" />
          <span>BookRec</span>
        </Link>

        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <BookOpen className="inline-block mr-1" size={18} />
            Discover
          </Link>
          <Link 
            to="/for-you" 
            className={`nav-link ${location.pathname === '/for-you' ? 'active' : ''}`}
          >
            <Sparkles className="inline-block mr-1" size={18} />
            For You
          </Link>
          <Link 
            to="/favorites" 
            className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}
          >
            <Heart className="inline-block mr-1" size={18} />
            Favorites
          </Link>
          <Link 
            to="/reviews" 
            className={`nav-link ${location.pathname === '/reviews' ? 'active' : ''}`}
          >
            <MessageSquare className="inline-block mr-1" size={18} />
            Reviews
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            <User className="inline-block mr-1" size={18} />
            Profile
          </Link>
          <button 
            onClick={handleLogout}
            className="nav-link text-red-500 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}