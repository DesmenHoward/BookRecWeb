import { useState, useEffect } from 'react';
import { useBookStore } from '../store/bookStore';
import { useAuthStore } from '../store/authStore';
import { useUserProfileStore } from '../store/userProfileStore';
import { useReviewStore } from '../store/reviewStore';
import { useRouter } from 'expo-router';
import { BookOpen, Star } from 'lucide-react';
import Header from './Header';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileSocialLinks from './ProfileSocialLinks';
import ProfileMenu from './ProfileMenu';
import EditProfileModal from './EditProfileModal';
import ProfilePhotoModal from './ProfilePhotoModal';
import SettingsModal from './SettingsModal';
import BookReviewModal from './BookReviewModal';
import ReviewsList from './ReviewsList';
import ReadingAnalytics from './ReadingAnalytics';
import MountRushmoreBooks from './MountRushmoreBooks';
import AdminSettings from './AdminSettings';
import LoadingIndicator from './LoadingIndicator';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, updateProfile, initializeProfile, isLoading } = useUserProfileStore();
  const { favorites } = useBookStore();
  const { addReview, reviews } = useReviewStore();
  
  // Modal states
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [adminSettingsVisible, setAdminSettingsVisible] = useState(false);
  const [settingsType, setSettingsType] = useState<'settings' | 'privacy' | 'notifications' | 'appearance' | 'help'>('settings');
  const [activeTab, setActiveTab] = useState<'preferences' | 'reviews'>('preferences');

  // Initialize profile when component mounts or user changes
  useEffect(() => {
    if (user) {
      initializeProfile();
    }
  }, [user, initializeProfile]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!user || !profile) {
    router.replace('/login');
    return null;
  }

  const handleEditProfile = () => {
    setEditProfileModalVisible(true);
  };

  const handlePhotoChange = () => {
    setPhotoModalVisible(true);
  };

  const handleSettingsPress = (type: 'settings' | 'privacy' | 'notifications' | 'appearance' | 'help') => {
    setSettingsType(type);
    setSettingsModalVisible(true);
  };

  const handleAdminSettings = () => {
    setAdminSettingsVisible(true);
  };

  const handleTabChange = (tab: 'preferences' | 'reviews') => {
    setActiveTab(tab);
  };

  const handleUpdateMountRushmore = (books: any[]) => {
    updateProfile({ mountRushmoreBooks: books });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Profile" 
        showBackButton={false}
        showSearch={false}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ProfileHeader 
          displayName={profile.displayName}
          bio={profile.bio}
          avatar={profile.profilePicture}
          onEditProfile={handleEditProfile}
          onPhotoChange={handlePhotoChange}
        />

        <div className="mt-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => handleTabChange('preferences')}
              className={`
                flex-1 py-2 px-4 rounded-lg font-medium
                ${activeTab === 'preferences' ? 'bg-primary text-white' : 'bg-white text-gray-600'}
              `}
            >
              <BookOpen className="inline-block mr-2" size={20} />
              Preferences
            </button>
            <button
              onClick={() => handleTabChange('reviews')}
              className={`
                flex-1 py-2 px-4 rounded-lg font-medium
                ${activeTab === 'reviews' ? 'bg-primary text-white' : 'bg-white text-gray-600'}
              `}
            >
              <Star className="inline-block mr-2" size={20} />
              Reviews
            </button>
          </div>

          {activeTab === 'preferences' ? (
            <>
              <ProfileStats 
                onPressStats={() => {}}
                stats={{
                  read: reviews.filter(r => r.rating > 0).length,
                  favorites: favorites.length,
                  reviews: reviews.length
                }}
              />
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Mount Rushmore Books</h3>
                <MountRushmoreBooks 
                  books={profile.mountRushmoreBooks || []}
                  onUpdateMountRushmore={handleUpdateMountRushmore}
                />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Reading Analytics</h3>
                <ReadingAnalytics />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Social Links</h3>
                <ProfileSocialLinks 
                  instagram={profile.socialLinks?.instagram}
                  twitter={profile.socialLinks?.twitter}
                  website={profile.socialLinks?.website}
                />
              </div>
            </>
          ) : (
            <ReviewsList 
              onAddReview={() => setReviewModalVisible(true)}
              userReviews={reviews}
              canEdit={true}
            />
          )}
        </div>

        <ProfileMenu 
          onSettingsPress={handleSettingsPress}
          onAdminSettings={handleAdminSettings}
          isAdmin={profile.role === 'admin'}
        />
      </div>

      {/* Modals */}
      <EditProfileModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        initialProfile={profile}
        onSave={updateProfile}
      />

      <ProfilePhotoModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
      />

      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        type={settingsType}
      />

      <BookReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={addReview}
      />

      <AdminSettings
        visible={adminSettingsVisible}
        onClose={() => setAdminSettingsVisible(false)}
      />
    </div>
  );
}