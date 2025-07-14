import { create } from 'zustand';
import { Book } from '../types/book';

export interface BookClub {
  id?: string;
  name: string;
  description: string;
  categories: string[];
  currentBook: Book;
  books: Book[];
  coverImage: string;
  nextMeeting: string;
}

interface BookClubStore {
  bookClubs: BookClub[];
  createBookClub: (club: BookClub) => void;
  updateBookClub: (id: string, club: Partial<BookClub>) => void;
  deleteBookClub: (id: string) => void;
}

export const useBookClubStore = create<BookClubStore>((set) => ({
  bookClubs: [],
  createBookClub: (club) => {
    set((state) => ({
      bookClubs: [...state.bookClubs, { ...club, id: crypto.randomUUID() }]
    }));
  },
  updateBookClub: (id, updates) => {
    set((state) => ({
      bookClubs: state.bookClubs.map((club) =>
        club.id === id ? { ...club, ...updates } : club
      )
    }));
  },
  deleteBookClub: (id) => {
    set((state) => ({
      bookClubs: state.bookClubs.filter((club) => club.id !== id)
    }));
  }
}));
