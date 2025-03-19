import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReadingSession {
  date: string;
  duration: number;
}

interface ReadingState {
  sessions: ReadingSession[];
  totalHours: number;
  weeklyHours: number;
  monthlyHours: number;
  currentStreak: number;
  longestStreak: number;
  averageHoursPerDay: number;
  
  // Actions
  addReadingSession: (duration: number) => void;
  calculateStats: () => void;
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set, get) => ({
      sessions: [],
      totalHours: 0,
      weeklyHours: 0,
      monthlyHours: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageHoursPerDay: 0,

      addReadingSession: (duration: number) => {
        const today = new Date().toISOString().split('T')[0];
        const newSession = { date: today, duration };
        
        set((state) => ({
          sessions: [...state.sessions, newSession]
        }));
        
        get().calculateStats();
      },

      calculateStats: () => {
        const { sessions } = get();
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Calculate total hours
        const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0);
        
        // Calculate weekly hours
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weeklyHours = sessions
          .filter(session => new Date(session.date) >= weekStart)
          .reduce((sum, session) => sum + session.duration, 0);
        
        // Calculate monthly hours
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyHours = sessions
          .filter(session => new Date(session.date) >= monthStart)
          .reduce((sum, session) => sum + session.duration, 0);
        
        // Calculate streaks
        let currentStreak = 0;
        let longestStreak = 0;
        let currentDate = new Date(today);
        
        // Check if read today
        const readToday = sessions.some(session => session.date === today);
        if (readToday) {
          currentStreak = 1;
          
          // Count backwards from yesterday
          let checkDate = new Date(currentDate);
          checkDate.setDate(checkDate.getDate() - 1);
          
          while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (sessions.some(session => session.date === dateStr)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
        
        // Find longest streak
        const dates = [...new Set(sessions.map(s => s.date))].sort();
        let tempStreak = 1;
        
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
        
        // Calculate average hours per day
        const uniqueDates = new Set(sessions.map(s => s.date));
        const averageHoursPerDay = totalHours / Math.max(uniqueDates.size, 1);
        
        set({
          totalHours,
          weeklyHours,
          monthlyHours,
          currentStreak,
          longestStreak,
          averageHoursPerDay
        });
      }
    }),
    {
      name: 'reading-stats-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);