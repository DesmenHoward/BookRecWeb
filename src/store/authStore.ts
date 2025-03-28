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

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
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
      isAdmin: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const isAdmin = email === 'desmenhoward23@gmail.com';
          set({ 
            user: userCredential.user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null,
            isAdmin
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false, isAuthenticated: false, isAdmin: false });
        }
      },

      signUp: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const isAdmin = email === 'desmenhoward23@gmail.com';
          set({ 
            user: userCredential.user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null,
            isAdmin
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false, isAuthenticated: false, isAdmin: false });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await signOut(auth);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null,
            isAdmin: false 
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateUserEmail: async (currentPassword: string, newEmail: string) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        try {
          set({ isLoading: true, error: null });
          
          // Re-authenticate user
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          
          // Update email
          await updateEmail(user, newEmail);
          set({ 
            user: { ...user, email: newEmail },
            error: null 
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateUserPassword: async (currentPassword: string, newPassword: string) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        try {
          set({ isLoading: true, error: null });
          
          // Re-authenticate user
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          
          // Update password
          await updatePassword(user, newPassword);
          set({ error: null });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAccount: async (currentPassword: string) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        try {
          set({ isLoading: true, error: null });
          
          // Re-authenticate user before deletion
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          
          // Delete the user
          await deleteUser(user);
          
          // Clear auth state
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'auth-storage', getStorage: () => localStorage }
  )
);