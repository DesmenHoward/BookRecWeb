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
      extraLarge?: string;  // Added for high-res images
      large?: string;       // Added for high-res images
      medium?: string;      // Added for medium-res images
    };
    categories: string[];
    averageRating?: number;
    ratingsCount?: number;
    pageCount?: number;
    language: string;
    previewLink: string;
    infoLink: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  coverImages: {
    small: string;    // For thumbnails (400x600)
    medium: string;   // For list views (600x900)
    large: string;    // For detailed views (800x1200)
  };
  description: string;
  genres: string[];
  publishedYear: number;
  rating?: number;
  reviewCount?: number;
  status?: 'read' | 'already-read' | 'not-interested' | null;
  isbn?: string;      // ISBN-13 or ISBN-10
  isbn13?: string;    // ISBN-13 specifically
  isbn10?: string;    // ISBN-10 specifically
}

export interface FirestoreBook {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  genres: string[];
  rating: number;
  reviewCount: number;
  coverImages: {
    small: string;
    medium: string;
    large: string;
  };
}