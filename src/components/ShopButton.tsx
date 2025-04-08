import type { FC } from 'react';
import { Book } from '../types/book';
import { ShoppingCart } from 'lucide-react';
import { getAmazonSearchLink } from '../utils/amazonLink';

interface ShopButtonProps {
  book: Book;
  className?: string;
  variant?: 'default' | 'light';
}

const ShopButton: FC<ShopButtonProps> = ({ book, className = '', variant = 'default' }) => {
  const handleClick = () => {
    const amazonLink = getAmazonSearchLink(book);
    window.open(amazonLink, '_blank', 'noopener,noreferrer');
  };

  const baseClasses = 'flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors';
  const variantClasses = variant === 'light' 
    ? 'bg-white/10 text-white hover:bg-white/20' 
    : 'bg-amber-500 text-white hover:bg-amber-600';

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      title={`Buy "${book.title}" on Amazon`}
    >
      <ShoppingCart size={20} />
      Shop
    </button>
  );
};

export default ShopButton;
