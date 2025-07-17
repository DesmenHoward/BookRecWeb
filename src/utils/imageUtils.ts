/**
 * Utility functions for handling images
 */

/**
 * Checks if an image URL is valid by attempting to load it
 * @param url The image URL to check
 * @returns A promise that resolves to true if the image is valid, false otherwise
 */
export function isImageUrlValid(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      resolve(true);
    };
    
    img.onerror = () => {
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * Gets a fallback image URL for a book with the given title
 * @param title The book title
 * @returns A fallback image URL
 */
export function getBookFallbackImage(title: string): string {
  // Encode the title for use in the URL
  const encodedTitle = encodeURIComponent(title.substring(0, 30));
  return `https://via.placeholder.com/400x600?text=${encodedTitle}`;
}
