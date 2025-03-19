export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    description: string;
    publishedDate: string;
    imageLinks?: {
      thumbnail: string;
      smallThumbnail: string;
    };
    categories: string[];
    averageRating?: number;
    ratingsCount?: number;
    pageCount?: number;
    language: string;
    previewLink: string;
    infoLink: string;
  };
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  genres: string[];
  publishedYear: number;
  rating?: number;
  status?: 'read' | 'already-read' | 'not-interested' | null;
}

export interface SwipeAction {
  bookId: string;
  liked: boolean;
}