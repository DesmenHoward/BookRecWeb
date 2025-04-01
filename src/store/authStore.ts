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
  deleteUser,
  User
} from 'firebase/auth';
import { useAdminStore } from './adminStore';

// Store registered users in localStorage
const REGISTERED_USERS_KEY = 'registered-users';

interface RegisteredUser {
  uid: string;
  email: string;
  displayName?: string;
  dateJoined: string;
  banned?: boolean;
}

const getRegisteredUsers = (): RegisteredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const addRegisteredUser = (user: RegisteredUser) => {
  const users = getRegisteredUsers();
  if (!users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
    users.push(user);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  }
};

const isUserBanned = (email: string): boolean => {
  const users = getRegisteredUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return user?.banned || false;
};

interface AuthState {
  user: User | null;
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

type AuthStateCreator = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null } as Partial<AuthStateCreator>);
        try {
          // Check if user is banned before attempting login
          if (isUserBanned(email)) {
            throw new Error('ACCOUNT_BANNED');
          }

          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          set({ 
            user: userCredential.user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null
          } as Partial<AuthStateCreator>);
          // Check admin status after login
          useAdminStore.getState().checkAdminStatus(email);
        } catch (error: any) {
          let errorMessage = 'Failed to sign in';
          if (error.message === 'ACCOUNT_BANNED') {
            errorMessage = 'This account has been banned. Please contact support for assistance.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password';
          } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email';
          }
          set({ error: errorMessage, isLoading: false, isAuthenticated: false } as Partial<AuthStateCreator>);
          throw new Error(errorMessage);
        }
      },

      signUp: async (email: string, password: string) => {
        set({ isLoading: true, error: null } as Partial<AuthStateCreator>);
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Add user to registered users list
          addRegisteredUser({
            uid: userCredential.user.uid,
            email: userCredential.user.email || email,
            displayName: userCredential.user.displayName || undefined,
            dateJoined: new Date().toISOString(),
            banned: false
          });
          
          set({ 
            user: userCredential.user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null
          } as Partial<AuthStateCreator>);
          
          // Check admin status after signup
          useAdminStore.getState().checkAdminStatus(email);
        } catch (error: any) {
          let errorMessage = 'Failed to create account';
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'An account already exists with this email';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak';
          }
          set({ error: errorMessage, isLoading: false, isAuthenticated: false } as Partial<AuthStateCreator>);
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          } as Partial<AuthStateCreator>);
        } catch (error: any) {
          set({ error: error.message } as Partial<AuthStateCreator>);
          throw error;
        }
      },

      updateUserEmail: async (currentPassword: string, newEmail: string) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('No user logged in');
        
        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, newEmail);
          
          // Update email in registered users list
          const users = getRegisteredUsers();
          const userIndex = users.findIndex(u => u.uid === user.uid);
          if (userIndex !== -1) {
            users[userIndex].email = newEmail;
            localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
          }
          
          set({ user: auth.currentUser } as Partial<AuthStateCreator>);
        } catch (error: any) {
          set({ error: error.message } as Partial<AuthStateCreator>);
          throw error;
        }
      },

      updateUserPassword: async (currentPassword: string, newPassword: string) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('No user logged in');
        
        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
        } catch (error: any) {
          set({ error: error.message } as Partial<AuthStateCreator>);
          throw error;
        }
      },

      deleteAccount: async (currentPassword: string) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error('No user logged in');
        
        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          
          // Remove from registered users list
          const users = getRegisteredUsers();
          const updatedUsers = users.filter(u => u.uid !== user.uid);
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
          
          await deleteUser(user);
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          } as Partial<AuthStateCreator>);
        } catch (error: any) {
          set({ error: error.message } as Partial<AuthStateCreator>);
          throw error;
        }
      },

      clearError: () => set({ error: null } as Partial<AuthStateCreator>),
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthState) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);