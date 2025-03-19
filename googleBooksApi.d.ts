declare module '../../googleBooksApi' {
  // Define the type for a book
  interface Book {
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      description?: string;
      imageLinks?: {
        thumbnail?: string;
      };
    };
  }

  // Function to search books using Google Books API
  export function searchBooks(query: string): Promise<Book[]>;

  // Function to save book to local storage
  export function saveBookToStorage(book: Book): void;
}
