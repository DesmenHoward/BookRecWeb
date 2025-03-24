import { Book } from '../types/book';

// Your Amazon Associates tracking ID should be stored in an environment variable
const AMAZON_AFFILIATE_ID = process.env.REACT_APP_AMAZON_AFFILIATE_ID || 'bookrec-20';

export const getAmazonSearchLink = (book: Book) => {
  // If we have an ISBN-13, use it for most accurate results
  if (book.isbn13) {
    return `https://www.amazon.com/dp/${book.isbn13}?tag=${AMAZON_AFFILIATE_ID}`;
  }
  
  // If we have an ISBN-10, use that
  if (book.isbn10) {
    return `https://www.amazon.com/dp/${book.isbn10}?tag=${AMAZON_AFFILIATE_ID}`;
  }

  // If we have a general ISBN, use that
  if (book.isbn) {
    return `https://www.amazon.com/dp/${book.isbn}?tag=${AMAZON_AFFILIATE_ID}`;
  }
  
  // If no ISBN is available, use a search query with exact title and author
  const searchQuery = encodeURIComponent(`"${book.title}" ${book.author}`);
  return `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks&tag=${AMAZON_AFFILIATE_ID}`;
};
