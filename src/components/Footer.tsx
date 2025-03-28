import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            &copy; 2025 BookRec. All rights reserved.
          </div>
          <Link to="/" className="mx-4">
            <BookOpen className="w-8 h-8 rounded-lg" />
          </Link>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link
              to="/contact"
              className="text-gray-600 hover:text-blue-500 transition-colors text-sm"
            >
              Contact Us
            </Link>
            <Link
              to="/terms"
              className="text-gray-600 hover:text-blue-500 transition-colors text-sm"
            >
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
