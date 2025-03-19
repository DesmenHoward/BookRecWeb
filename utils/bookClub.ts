import { BookClub } from '../store/bookClubStore';
import { Book } from '../types/book';
import { getRandomPun } from './genrePuns';

// Generate a unique, safe club ID
export function generateClubId(name: string): string {
  const safeId = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `club-${safeId}-${Date.now()}`;
}

// Generate a description for a book club based on its categories
export function generateClubDescription(categories: string[]): string {
  if (categories.length === 0) return 'A book club for all types of readers.';
  
  if (categories.length === 1) {
    return `A club dedicated to exploring and discussing ${categories[0]} books.`;
  }
  
  const lastCategory = categories[categories.length - 1];
  const otherCategories = categories.slice(0, -1).join(', ');
  
  return `A book club focused on ${otherCategories} and ${lastCategory} literature.`;
}

// Generate a fun name for a book club based on its main category
export function generateClubName(mainCategory: string): string {
  const pun = getRandomPun(mainCategory);
  return `The ${pun} Book Club`;
}

// Calculate the next meeting date (always set to a future date)
export function calculateNextMeeting(): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 days from now
  return date.toISOString();
}

// Format meeting date for display
export function formatMeetingDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get recommended book clubs based on user's reading preferences
export function getRecommendedClubs(
  allClubs: BookClub[],
  userGenres: string[],
  limit: number = 5
): BookClub[] {
  return allClubs
    .filter(club => !club.isJoined) // Don't recommend clubs user is already in
    .filter(club => 
      club.categories.some(category => userGenres.includes(category))
    )
    .sort((a, b) => {
      // Count matching categories
      const aMatches = a.categories.filter(cat => userGenres.includes(cat)).length;
      const bMatches = b.categories.filter(cat => userGenres.includes(cat)).length;
      
      // Sort by number of matches (descending) and then by member count
      return bMatches - aMatches || b.members - a.members;
    })
    .slice(0, limit);
}

// Get trending book clubs (most active/popular)
export function getTrendingClubs(
  allClubs: BookClub[],
  limit: number = 5
): BookClub[] {
  return [...allClubs]
    .sort((a, b) => b.members - a.members)
    .slice(0, limit);
}

// Check if a user can create a new book club
export function canCreateBookClub(
  userJoinedClubs: BookClub[],
  maxClubs: number = 5
): boolean {
  return userJoinedClubs.length < maxClubs;
}

// Validate book club data
export function validateBookClub(club: Partial<BookClub>): string | null {
  if (!club.name?.trim()) {
    return 'Club name is required';
  }
  
  if (!club.description?.trim()) {
    return 'Club description is required';
  }
  
  if (!club.categories?.length) {
    return 'At least one category is required';
  }
  
  if (!club.currentBook) {
    return 'Current book is required';
  }
  
  return null;
}