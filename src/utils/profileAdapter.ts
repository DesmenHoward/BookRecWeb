/**
 * This adapter helps convert between different UserProfile interfaces in the codebase
 * to ensure type compatibility between components
 */

import { UserProfile as StoreUserProfile } from '../store/userProfileStore';
import { UserProfile as TypeUserProfile } from '../types/user';

/**
 * Adapts a UserProfile from userProfileStore to be compatible with the types/user UserProfile
 */
export function adaptStoreProfileToTypeProfile(profile: StoreUserProfile): TypeUserProfile {
  // Create a new object with the correct structure for TypeUserProfile
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    email: profile.email,
    bio: profile.bio,
    profilePicture: profile.profilePicture,
    location: profile.location || '',
    website: profile.website || '',
    joinDate: profile.joinDate,
    language: profile.language,
    // Add fields that exist in TypeUserProfile but not in StoreUserProfile
    nickname: '',
    role: 'user',
    mountRushmoreBooks: [],
    // Map the privacy settings
    privacySettings: {
      showEmail: false,
      showLocation: false,
      showReadingStats: true
    },
    socialLinks: profile.socialLinks,
    theme: profile.theme,
    notificationSettings: {
      newFollowers: false,
      newComments: false,
      newLikes: false,
      newsletter: false
    }
  };
}

/**
 * Adapts a UserProfile from types/user to be compatible with the userProfileStore UserProfile
 */
export function adaptTypeProfileToStoreProfile(profile: TypeUserProfile): StoreUserProfile {
  // Create a new object with the correct structure for StoreUserProfile
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    email: profile.email,
    bio: profile.bio,
    profilePicture: profile.profilePicture,
    location: profile.location || '',
    website: profile.website || '',
    joinDate: profile.joinDate,
    language: profile.language,
    mountRushmoreBooks: profile.mountRushmoreBooks || [],
    socialLinks: profile.socialLinks,
    // Map the privacy settings to the structure expected by StoreUserProfile
    privacySettings: {
      showReadingActivity: profile.privacySettings?.showReadingStats || true,
      showFavorites: true,
      allowRecommendations: true
    },
    theme: profile.theme,
    notificationSettings: {
      newRecommendations: true,
      friendActivity: true,
      appUpdates: true
    }
  };
}
