import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReadingStats {
  booksRead: number;
  pagesRead: number;
  readingStreak: number;
  averageRating: number;
  timeSpentReading: number;
  lastReadDate: string | null;
}

interface ReadingState extends ReadingStats {
  updateStats: (stats: Partial<ReadingStats>) => void;
  incrementBooksRead: () => void;
  addPagesRead: (pages: number) => void;
  updateReadingStreak: () => void;
  updateAverageRating: (rating: number) => void;
  addReadingTime: (minutes: number) => void;
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      booksRead: 0,
      pagesRead: 0,
      readingStreak: 0,
      averageRating: 0,
      timeSpentReading: 0,
      lastReadDate: null,

      updateStats: (stats) => set((state) => ({ ...state, ...stats })),

      incrementBooksRead: () => set((state) => ({ booksRead: state.booksRead + 1 })),

      addPagesRead: (pages) => set((state) => ({ pagesRead: state.pagesRead + pages })),

      updateReadingStreak: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastReadDate === today) return state;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        return {
          readingStreak: state.lastReadDate === yesterdayStr ? state.readingStreak + 1 : 1,
          lastReadDate: today,
        };
      }),

      updateAverageRating: (rating) =>
        set((state) => ({
          averageRating: state.booksRead === 0
            ? rating
            : (state.averageRating * state.booksRead + rating) / (state.booksRead + 1),
        })),

      addReadingTime: (minutes) =>
        set((state) => ({ timeSpentReading: state.timeSpentReading + minutes })),
    }),
    {
      name: 'reading-store',
    }
  )
);
