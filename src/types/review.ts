import { Book } from './book';

export interface Review {
  id: string;
  book: Book;
  text: string;
  rating: number;
  date: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isPublic: boolean;
  containsSpoiler?: boolean;
  spoilerType?: 'general' | 'plot' | 'ending' | 'sensitive';
  spoilerWarning?: string;
}

export default Review;
