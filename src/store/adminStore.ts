import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// List of admin email addresses
const ADMIN_EMAILS = ['desmenhoward23@gmail.com'];

interface AdminState {
  isAdmin: boolean;
  isAdminModalOpen: boolean;
  error: string | null;
  checkAdminStatus: (email: string) => void;
  setIsAdmin: (value: boolean) => void;
  setIsAdminModalOpen: (value: boolean) => void;
  setError: (error: string | null) => void;
}

// Create the store
const createAdminStore = (set: any) => ({
  isAdmin: false,
  isAdminModalOpen: false,
  error: null,
  checkAdminStatus: (email: string) => {
    console.log('Checking admin status for email:', email);
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    console.log('Admin check result:', isAdmin);
    set({ isAdmin });
  },
  setIsAdmin: (value: boolean) => {
    console.log('Setting admin status to:', value);
    set({ isAdmin: value });
  },
  setIsAdminModalOpen: (value: boolean) => set({ isAdminModalOpen: value }),
  setError: (error: string | null) => set({ error }),
});

// Export the store with persistence
export const useAdminStore = create<AdminState>()(
  persist(
    createAdminStore,
    {
      name: 'admin-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        isAdmin: state.isAdmin,
      }),
    }
  )
);
