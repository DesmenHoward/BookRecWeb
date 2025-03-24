import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// List of admin email addresses
const ADMIN_EMAILS = ['desmenhoward23@gmail.com'];

interface AdminState {
  isAdmin: boolean;
  isAdminModalOpen: boolean;
  error: string | null;
  checkAdminStatus: (email: string) => boolean;
  setIsAdmin: (value: boolean) => void;
  setIsAdminModalOpen: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdmin: false,
      isAdminModalOpen: false,
      error: null,
      checkAdminStatus: (email: string) => {
        const isAdmin = ADMIN_EMAILS.includes(email);
        set({ isAdmin });
        return isAdmin;
      },
      setIsAdmin: (value) => set({ isAdmin: value }),
      setIsAdminModalOpen: (value) => set({ isAdminModalOpen: value }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'admin-storage',
      getStorage: () => localStorage,
    }
  )
);
