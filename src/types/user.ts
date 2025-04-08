export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  profilePicture: string;
  location?: string;
  website?: string;
  joinDate: string;
  nickname?: string;
  role?: 'user' | 'admin';
  language: string;
  mountRushmoreBooks: string[];
  socialLinks: {
    twitter: string;
    instagram: string;
    goodreads: string;
  };
  privacySettings: {
    showEmail: boolean;
    showLocation: boolean;
    showReadingStats: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  notificationSettings: {
    newFollowers: boolean;
    newComments: boolean;
    newLikes: boolean;
    newsletter: boolean;
  };
}
