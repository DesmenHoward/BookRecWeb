import { create } from 'zustand';
import { Book } from '../types/book';
import { useUserProfileStore } from './userProfileStore';

export interface BookClub {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  members: number;
  currentBook: Book;
  books: Book[];
  nextMeeting: string;
  categories: string[];
  isJoined: boolean;
  createdBy: string;
  createdAt: string;
}

interface BookClubState {
  bookClubs: BookClub[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createBookClub: (club: Omit<BookClub, 'id' | 'createdAt'>) => void;
  joinBookClub: (clubId: string) => void;
  leaveBookClub: (clubId: string) => void;
  updateBookClub: (clubId: string, updates: Partial<BookClub>) => void;
  deleteBookClub: (clubId: string) => void;
  getBookClubById: (clubId: string) => BookClub | null;
  getJoinedBookClubs: () => BookClub[];
  searchBookClubs: (query: string) => BookClub[];
  filterBookClubsByCategory: (category: string) => BookClub[];
}

export const useBookClubStore = create<BookClubState>((set, get) => ({
  bookClubs: [],
  isLoading: false,
  error: null,

  createBookClub: (club) => {
    const { profile } = useUserProfileStore.getState();
    
    const newClub: BookClub = {
      ...club,
      id: `club-${Date.now()}`,
      createdBy: profile.id,
      createdAt: new Date().toISOString(),
      isJoined: true,
      members: 1
    };

    set(state => ({
      bookClubs: [newClub, ...state.bookClubs]
    }));
  },

  joinBookClub: (clubId) => {
    set(state => ({
      bookClubs: state.bookClubs.map(club => 
        club.id === clubId 
          ? { ...club, isJoined: true, members: club.members + 1 }
          : club
      )
    }));
  },

  leaveBookClub: (clubId) => {
    set(state => ({
      bookClubs: state.bookClubs.map(club => 
        club.id === clubId 
          ? { ...club, isJoined: false, members: club.members - 1 }
          : club
      )
    }));
  },

  updateBookClub: (clubId, updates) => {
    set(state => ({
      bookClubs: state.bookClubs.map(club => 
        club.id === clubId ? { ...club, ...updates } : club
      )
    }));
  },

  deleteBookClub: (clubId) => {
    set(state => ({
      bookClubs: state.bookClubs.filter(club => club.id !== clubId)
    }));
  },

  getBookClubById: (clubId) => {
    return get().bookClubs.find(club => club.id === clubId) || null;
  },

  getJoinedBookClubs: () => {
    return get().bookClubs.filter(club => club.isJoined);
  },

  searchBookClubs: (query) => {
    const searchTerm = query.toLowerCase();
    return get().bookClubs.filter(club => 
      club.name.toLowerCase().includes(searchTerm) ||
      club.description.toLowerCase().includes(searchTerm) ||
      club.categories.some(cat => cat.toLowerCase().includes(searchTerm))
    );
  },

  filterBookClubsByCategory: (category) => {
    return category === 'All' 
      ? get().bookClubs
      : get().bookClubs.filter(club => club.categories.includes(category));
  }
}));