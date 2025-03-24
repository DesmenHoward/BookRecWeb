import type { FC } from 'react';
import { Book } from '../types/book';
import { ShoppingCart } from 'lucide-react';
import { getAmazonSearchLink } from '../utils/amazonLink';

interface ShopButtonProps {
  book: Book;
  className?: string;
}

const ShopButton: FC<ShopButtonProps> = ({ book, className = '' }) => {
  const handleClick = () => {
    const amazonLink = getAmazonSearchLink(book);
    window.open(amazonLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        bg-amber-500 text-white hover:bg-amber-600
        transition-colors
        ${className}
      `}
      title={`Buy "${book.title}" on Amazon`}
    >
      <ShoppingCart size={20} />
      Shop
    </button>
  );
};

export default ShopButton;
