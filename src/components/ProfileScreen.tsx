import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUserProfileStore } from '../store/userProfileStore';
import { useReviewStore } from '../store/reviewStore';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile, updateProfile, initializeProfile, isLoading } = useUserProfileStore();
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
    navigate('/login');
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

  const handleUpdateMountRushmore = (books: (string | null)[]) => {
    updateProfile({ mountRushmoreBooks: books.filter(Boolean) as string[] });
  };

  const handleStatsPress = (statType: 'swiped' | 'favorites' | 'recommendations') => {
    // Handle stats press - can be implemented later
    console.log('Stats pressed:', statType);
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
          profile={profile}
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
                onPressStats={handleStatsPress}
              />
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Mount Rushmore Books</h3>
                <MountRushmoreBooks 
                  onUpdateBooks={handleUpdateMountRushmore}
                  selectedBooks={profile.mountRushmoreBooks || []}
                />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Reading Analytics</h3>
                <ReadingAnalytics />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Social Links</h3>
                <ProfileSocialLinks />
              </div>
            </>
          ) : (
            <ReviewsList 
              reviews={reviews.map(review => ({
                id: review.id || '',
                book: {
                  id: review.bookId,
                  title: review.bookTitle,
                  author: '',
                  coverUrl: '',
                  coverImages: {
                    small: '',
                    medium: '',
                    large: ''
                  },
                  description: '',
                  genres: [],
                  publishedYear: 0,
                  rating: 0,
                  status: null
                },
                date: review.createdAt.toISOString(),
                rating: review.rating,
                text: review.text,
                userId: review.userId,
                userName: review.userName,
                isPublic: review.isPublic || false
              }))}
              onAddReview={() => setReviewModalVisible(true)}
              canEdit={true}
            />
          )}
        </div>

        <ProfileMenu 
          onPressMenuItem={(type) => {
            if (type === 'admin') {
              handleAdminSettings();
            } else {
              handleSettingsPress(type as 'settings' | 'privacy' | 'notifications' | 'appearance' | 'help');
            }
          }}
        />
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
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
        onSubmit={async ({ book, rating, text, isPublic }) => {
          await addReview({
            bookId: book.id,
            bookTitle: book.title,
            userId: user.uid,
            userName: profile.displayName,
            rating,
            text,
            // createdAt will be added by the addReview function
            isPublic: isPublic || true
          });
          setReviewModalVisible(false);
        }}
      />

      {adminSettingsVisible && (
        <AdminSettings
          onClose={() => setAdminSettingsVisible(false)}
        />
      )}
    </div>
  );
}