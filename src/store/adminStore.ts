import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// List of admin email addresses
const ADMIN_EMAILS = ['desmenhoward23@gmail.com'];

interface AdminState {
  isAdmin: boolean;
  isAdminModalOpen: boolean;
  error: string | null;
  checkAdminStatus: (email: string) => Promise<void>;
  setIsAdmin: (value: boolean) => void;
  setIsAdminModalOpen: (value: boolean) => void;
  setError: (error: string | null) => void;
}

const createAdminStore = (set: any) => ({
  isAdmin: false,
  isAdminModalOpen: false,
  error: null as string | null,
  checkAdminStatus: async (email: string) => {
    try {
      console.log('Checking admin status for email:', email);
      const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      console.log('Admin check result:', isAdmin);
      set({ isAdmin, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  setIsAdmin: (value: boolean) => {
    console.log('Setting admin status to:', value);
    set({ isAdmin: value });
  },
  setIsAdminModalOpen: (value: boolean) => set({ isAdminModalOpen: value }),
  setError: (error: string | null) => set({ error }),
});

type AdminPersist = {
  isAdmin: boolean;
};

// Export the store with persistence
export const useAdminStore = create<AdminState>()(
  persist(
    createAdminStore,
    {
      name: 'admin-storage',
      getStorage: () => localStorage,
      partialize: (state: AdminState): AdminPersist => ({
        isAdmin: state.isAdmin,
      }),
    }
  )
);
