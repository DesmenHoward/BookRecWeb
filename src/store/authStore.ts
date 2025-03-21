import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isAdmin: false,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          set({ user: userCredential.user, isAuthenticated: true, isLoading: false, error: null });
        } catch (error: any) {
          set({ error: error.message, isLoading: false, isAuthenticated: false });
        }
      },
      signUp: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          set({ user: userCredential.user, isAuthenticated: true, isLoading: false, error: null });
        } catch (error: any) {
          set({ error: error.message, isLoading: false, isAuthenticated: false });
        }
      },
      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        } catch (error: any) {
          set({ error: 'Failed to sign out', isLoading: false });
        }
      },
      clearError: () => set({ error: null }),
    }),
    { name: 'auth-storage', getStorage: () => localStorage }
  )
);