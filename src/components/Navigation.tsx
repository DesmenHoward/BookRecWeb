import { Link, useLocation } from 'react-router-dom';
import { Heart, User, Sparkles, MessageSquare, BookOpen, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function Navigation() {
  const location = useLocation();
  const { logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        {/* Mobile Logo + Title Container */}
        <div className="flex-1 flex items-center lg:flex-initial">
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Link to="/" className="flex items-center">
              <img src="/favicon.PNG" alt="BookRec Logo" className="w-12 h-12 rounded-lg" />
            </Link>
            {/* Desktop title */}
            <Link to="/" className="hidden lg:flex text-2xl font-bold text-accent">
              BookRec
            </Link>
            {/* Mobile title - centered */}
            <span className="lg:hidden text-2xl font-bold text-accent flex-1 text-center">
              BookRec
            </span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 rounded-lg hover:bg-accent/10"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links lg:flex ${isMenuOpen ? 'mobile-menu-open' : 'mobile-menu-closed'}`}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <BookOpen className="nav-icon" size={20} />
            <span className="nav-text">Discover</span>
          </Link>
          <Link 
            to="/for-you" 
            className={`nav-link ${location.pathname === '/for-you' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Sparkles className="nav-icon" size={20} />
            <span className="nav-text">For You</span>
          </Link>
          <Link 
            to="/favorites" 
            className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Heart className="nav-icon" size={20} />
            <span className="nav-text">Favorites</span>
          </Link>
          <Link 
            to="/reviews" 
            className={`nav-link ${location.pathname === '/reviews' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <MessageSquare className="nav-icon" size={20} />
            <span className="nav-text">Reviews</span>
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <User className="nav-icon" size={20} />
            <span className="nav-text">Profile</span>
          </Link>
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="nav-link text-red-500 hover:bg-red-50 w-full flex items-center"
          >
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}