import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from './authStore';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  location: string;
  website: string;
  joinDate: string;
  socialLinks: {
    twitter: string;
    instagram: string;
    goodreads: string;
  };
  privacySettings: {
    showReadingActivity: boolean;
    showFavorites: boolean;
    allowRecommendations: boolean;
  };
  theme: 'dark' | 'light' | 'system';
  notificationSettings: {
    newRecommendations: boolean;
    friendActivity: boolean;
    appUpdates: boolean;
  };
  mountRushmoreBooks: any[];
}

// Create empty profile template
const createEmptyProfile = (userId: string): UserProfile => ({
  id: userId,
  username: '',
  displayName: 'New User',
  bio: '',
  profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  location: '',
  website: '',
  joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
  socialLinks: {
    twitter: '',
    instagram: '',
    goodreads: ''
  },
  privacySettings: {
    showReadingActivity: true,
    showFavorites: true,
    allowRecommendations: true
  },
  theme: 'dark',
  notificationSettings: {
    newRecommendations: true,
    friendActivity: true,
    appUpdates: true
  },
  mountRushmoreBooks: [null, null, null, null]
});

interface UserProfileState {
  profile: UserProfile | null;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setIsEditing: (isEditing: boolean) => void;
  resetProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isEditing: false,
      isLoading: false,
      error: null,
      
      initializeProfile: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ isLoading: true, error: null });
        
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Ensure mountRushmoreBooks exists with default value
            const profile = {
              ...userData,
              mountRushmoreBooks: userData.mountRushmoreBooks || [null, null, null, null]
            } as UserProfile;
            set({ profile, isLoading: false });
          } else {
            // Create new profile for first-time users
            const newProfile = createEmptyProfile(user.uid);
            await setDoc(userDocRef, newProfile);
            set({ profile: newProfile, isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      updateProfile: async (updates) => {
        const { user } = useAuthStore.getState();
        const currentProfile = get().profile;
        
        if (!user || !currentProfile) return;
        
        set({ isLoading: true, error: null });
        
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, updates);
          
          set(state => ({
            profile: state.profile ? { ...state.profile, ...updates } : null,
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      setIsEditing: (isEditing) => {
        set({ isEditing });
      },
      
      resetProfile: () => {
        set({ profile: null, isEditing: false, isLoading: false, error: null });
      }
    }),
    {
      name: 'user-profile-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);