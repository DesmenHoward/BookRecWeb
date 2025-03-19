import { Book } from './book';

export interface BookClubMember {
  id: string;
  userId: string;
  clubId: string;
  joinDate: string;
  role: 'admin' | 'moderator' | 'member';
}

export interface BookClubMeeting {
  id: string;
  clubId: string;
  date: string;
  title: string;
  description: string;
  book: Book;
  attendees: string[];
  location?: string;
  virtualMeetingUrl?: string;
}

export interface BookClubDiscussion {
  id: string;
  clubId: string;
  userId: string;
  bookId: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface BookClubComment {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}