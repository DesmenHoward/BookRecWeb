import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';
import { useAdminStore } from './adminStore';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          set({ 
            user: userCredential.user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null
          });
          // Check admin status after login
          useAdminStore.getState().checkAdminStatus(email);
        } catch (error: any) {
          set({ 
            error: error.message, 
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      signUp: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          set({ 
            user: userCredential.user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null
          });
        } catch (error: any) {
          set({ 
            error: error.message, 
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      updateUserEmail: async (currentPassword, newEmail) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('No user logged in');
        
        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, newEmail);
          set({ user: auth.currentUser });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      updateUserPassword: async (currentPassword, newPassword) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('No user logged in');

        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      deleteAccount: async (currentPassword) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('No user logged in');

        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await deleteUser(user);
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);