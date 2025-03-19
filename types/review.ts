import { Book } from './book';

export interface Review {
  id: string;
  bookId: string;
  book: Book;
  rating: number;
  text: string;
  date: string;
  isPublic: boolean;
  containsSpoiler?: boolean;
  spoilerType?: 'general' | 'plot' | 'ending' | 'sensitive';
  spoilerWarning?: string;
}