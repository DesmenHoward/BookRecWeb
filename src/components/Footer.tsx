import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-2 mt-auto">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex flex-row justify-between items-center">
          <div className="text-[10px] md:text-sm text-gray-600 whitespace-nowrap">
            &copy; 2025
          </div>
          <Link to="/" className="mx-2 md:mx-4 flex-shrink-0">
            <BookOpen className="w-5 h-5 md:w-8 md:h-8 rounded-lg" />
          </Link>
          <div className="flex items-center space-x-2 md:space-x-6 text-[10px] md:text-sm">
            <Link
              to="/contact"
              className="text-gray-600 hover:text-blue-500 transition-colors whitespace-nowrap"
            >
              Contact
            </Link>
            <Link
              to="/terms"
              className="text-gray-600 hover:text-blue-500 transition-colors whitespace-nowrap"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
