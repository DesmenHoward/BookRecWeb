import { BookClub } from '../store/bookClubStore';

export function validateBookClub(club: Partial<BookClub>): string | null {
  if (!club.name?.trim()) {
    return 'Club name is required';
  }

  if (!club.description?.trim()) {
    return 'Club description is required';
  }

  if (!club.currentBook) {
    return 'Please select a book for the club';
  }

  if (!club.categories?.length) {
    return 'Please select at least one category';
  }

  return null;
}
