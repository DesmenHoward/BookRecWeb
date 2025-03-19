import { create } from 'zustand';
import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User 
} from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Admin emails constant
const ADMIN_EMAILS = [
  'desmenhoward23@gmail.com'
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isAdmin: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ 
        user: userCredential.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isAdmin: ADMIN_EMAILS.includes(email.toLowerCase())
      });
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }
      set({ error: errorMessage, isLoading: false, isAuthenticated: false, isAdmin: false });
      throw new Error(errorMessage);
    }
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      set({ 
        user: userCredential.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isAdmin: ADMIN_EMAILS.includes(email.toLowerCase())
      });
    } catch (error: any) {
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account already exists with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters';
      }
      set({ error: errorMessage, isLoading: false, isAuthenticated: false, isAdmin: false });
      throw new Error(errorMessage);
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
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
      set({ 
        error: 'Failed to sign out',
        isLoading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));