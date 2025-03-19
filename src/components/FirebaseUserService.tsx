import { useFirebaseStore } from '../store/firebaseStore';
import { UserProfile } from '../store/userProfileStore';

// Interface for user profile data in Firestore
export interface FirestoreUserProfile {
  id?: string;
  userId: string;
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
}

// Collection name for user profiles in Firestore
const USER_PROFILES_COLLECTION = 'userProfiles';

// Hook for user profile operations with Firebase
export function useFirebaseUserService() {
  const { 
    addDocument, 
    getDocuments, 
    getDocument, 
    updateDocument, 
    queryDocuments,
    user
  } = useFirebaseStore();

  // Create or update user profile
  const saveUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Check if profile already exists
      const existingProfiles = await queryDocuments(
        USER_PROFILES_COLLECTION,
        'userId',
        '==',
        user.uid
      );
      
      if (existingProfiles.length > 0) {
        // Update existing profile
        await updateDocument(USER_PROFILES_COLLECTION, existingProfiles[0].id, profile);
      } else {
        // Create new profile
        const newProfile: FirestoreUserProfile = {
          userId: user.uid,
          username: profile.username || 'user' + Math.floor(Math.random() * 10000),
          displayName: profile.displayName || 'New User',
          bio: profile.bio || '',
          profilePicture: profile.profilePicture || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
          location: profile.location || '',
          website: profile.website || '',
          joinDate: profile.joinDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          socialLinks: profile.socialLinks || {
            twitter: '',
            instagram: '',
            goodreads: ''
          },
          privacySettings: profile.privacySettings || {
            showReadingActivity: true,
            showFavorites: true,
            allowRecommendations: true
          },
          theme: profile.theme || 'dark',
          notificationSettings: profile.notificationSettings || {
            newRecommendations: true,
            friendActivity: true,
            appUpdates: true
          }
        };
        
        await addDocument(USER_PROFILES_COLLECTION, newProfile);
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  };

  // Get current user's profile
  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    
    try {
      const profiles = await queryDocuments<FirestoreUserProfile>(
        USER_PROFILES_COLLECTION,
        'userId',
        '==',
        user.uid
      );
      
      if (profiles.length === 0) return null;
      
      const profile = profiles[0];
      
      return {
        id: user.uid,
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        profilePicture: profile.profilePicture,
        location: profile.location,
        website: profile.website,
        joinDate: profile.joinDate,
        socialLinks: profile.socialLinks,
        privacySettings: profile.privacySettings,
        theme: profile.theme,
        notificationSettings: profile.notificationSettings
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };

  // Get profile by username
  const getProfileByUsername = async (username: string): Promise<UserProfile | null> => {
    try {
      const profiles = await queryDocuments<FirestoreUserProfile>(
        USER_PROFILES_COLLECTION,
        'username',
        '==',
        username
      );
      
      if (profiles.length === 0) return null;
      
      const profile = profiles[0];
      
      return {
        id: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        profilePicture: profile.profilePicture,
        location: profile.location,
        website: profile.website,
        joinDate: profile.joinDate,
        socialLinks: profile.socialLinks,
        privacySettings: profile.privacySettings,
        theme: profile.theme,
        notificationSettings: profile.notificationSettings
      };
    } catch (error) {
      console.error(`Error getting profile for username ${username}:`, error);
      throw error;
    }
  };

  return {
    saveUserProfile,
    getUserProfile,
    getProfileByUsername
  };
}