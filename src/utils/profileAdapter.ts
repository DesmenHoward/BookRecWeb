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
  return {
    ...profile,
    privacySettings: {
      showEmail: profile.privacySettings?.showEmail || false,
      showLocation: profile.privacySettings?.showLocation || false,
      showReadingStats: profile.privacySettings?.showReadingStats || true
    },
    // Add any other necessary field conversions
  } as TypeUserProfile;
}

/**
 * Adapts a UserProfile from types/user to be compatible with the userProfileStore UserProfile
 */
export function adaptTypeProfileToStoreProfile(profile: TypeUserProfile): StoreUserProfile {
  return {
    ...profile,
    privacySettings: {
      showEmail: profile.privacySettings?.showEmail || false,
      showLocation: profile.privacySettings?.showLocation || false,
      showReadingStats: profile.privacySettings?.showReadingStats || true
    },
    // Add any other necessary field conversions
  } as StoreUserProfile;
}
