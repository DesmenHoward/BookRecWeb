import axios from 'axios';

const GOOGLE_BOOKS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Function to search books using Google Books API
export async function searchBooks(query) {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        key: GOOGLE_BOOKS_API_KEY,
      },
    });
    return response.data.items || [];
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

// Function to save book to local storage
export function saveBookToStorage(book) {
  // Implement your storage logic here
  console.log('Saving book to storage:', book);
}
