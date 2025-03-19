import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useBookStore } from '../store/bookStore';
import { useAuthStore } from '../store/authStore';
import { useUserProfileStore } from '../store/userProfileStore';
import { useReviewStore } from '../store/reviewStore';
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
import { useRouter } from 'expo-router';
import { BookOpen, Star, PenLine } from 'lucide-react-native';
import LoadingIndicator from './LoadingIndicator';

// Theme colors
const THEME = {
  primary: '#7D6E83',
  accent: '#A75D5D',
  background: '#F9F5EB',
  surface: '#EFE3D0',
  text: '#4F4557',
  textLight: '#7D6E83',
  border: '#D0B8A8'
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, updateProfile, initializeProfile, isLoading } = useUserProfileStore();
  const { favorites, favoriteGenres, userNickname } = useBookStore();
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
  }, [user]);

  // Show loading state while profile is being initialized
  if (isLoading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator message="Loading profile..." />
      </SafeAreaView>
    );
  }

  // Ensure we have mountRushmoreBooks with default value
  const mountRushmoreBooks = profile.mountRushmoreBooks || [null, null, null, null];
  
  // Get top 5 genres for display
  const topGenres = Object.entries(favoriteGenres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  const handleUpdateMountRushmore = (books: any[]) => {
    updateProfile({ mountRushmoreBooks: books });
  };

  const handleStatsPress = (statType: 'swiped' | 'favorites' | 'recommendations') => {
    switch (statType) {
      case 'swiped':
        Alert.alert('Books Swiped', 'This would show a list of all books you have swiped on.');
        break;
      case 'favorites':
        router.push('/favorites');
        break;
      case 'recommendations':
        router.push('/recommendations');
        break;
    }
  };
  
  const handleMenuItemPress = (menuItem: string) => {
    switch (menuItem) {
      case 'settings':
      case 'privacy':
      case 'notifications':
      case 'appearance':
      case 'help':
        setSettingsType(menuItem as any);
        setSettingsModalVisible(true);
        break;
      case 'admin':
        setAdminSettingsVisible(true);
        break;
      default:
        Alert.alert('Menu Item', `You pressed ${menuItem}`);
    }
  };
  
  const handleAddReview = () => {
    if (favorites.length === 0) {
      Alert.alert(
        'No Favorite Books',
        'You need to add books to your favorites before writing a review. Would you like to discover books now?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Discover Books',
            onPress: () => router.push('/')
          }
        ]
      );
      return;
    }
    setReviewModalVisible(true);
  };
  
  const handleSubmitReview = (review: any) => {
    addReview(review);
    
    Alert.alert(
      'Review Added',
      'Your book review has been successfully added!',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ProfileHeader 
          onEditProfile={() => setEditProfileModalVisible(true)}
          onChangePhoto={() => setPhotoModalVisible(true)}
        />
        
        <ProfileStats onPressStats={handleStatsPress} />

        <ReadingAnalytics />

        <MountRushmoreBooks 
          mountRushmoreBooks={mountRushmoreBooks}
          onUpdateMountRushmore={handleUpdateMountRushmore}
        />
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'preferences' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('preferences')}
          >
            <BookOpen 
              size={18} 
              color={activeTab === 'preferences' ? THEME.accent : THEME.textLight} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === 'preferences' && styles.activeTabButtonText
            ]}>Preferences</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'reviews' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('reviews')}
          >
            <Star 
              size={18} 
              color={activeTab === 'reviews' ? THEME.accent : THEME.textLight} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === 'reviews' && styles.activeTabButtonText
            ]}>Reviews</Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'preferences' ? (
          <>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Reading Preferences</Text>
              
              <View style={styles.preferencesList}>
                {topGenres.length > 0 ? (
                  <View style={styles.genreContainer}>
                    {topGenres.map((genre, index) => (
                      <View key={index} style={styles.genreTag}>
                        <Text style={styles.genreText}>{genre}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>
                    Swipe on more books to see your reading preferences
                  </Text>
                )}
              </View>
            </View>
            
            <ProfileSocialLinks />
          </>
        ) : (
          <View style={styles.reviewsContainer}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Your Book Reviews</Text>
              <TouchableOpacity 
                style={styles.writeReviewButton}
                onPress={handleAddReview}
              >
                <PenLine size={16} color="white" />
                <Text style={styles.writeReviewText}>Write Review</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.reviewsSubtitle}>
              {reviews.length === 0 
                ? "You haven't written any reviews yet" 
                : `You've written ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`}
            </Text>
            
            <ReviewsList onAddReview={handleAddReview} />
          </View>
        )}
        
        <ProfileMenu onPressMenuItem={handleMenuItemPress} />
        
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Book Tinder v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 Book Tinder</Text>
        </View>
      </ScrollView>
      
      <EditProfileModal 
        visible={editProfileModalVisible}
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
        onSubmit={handleSubmitReview}
      />

      <AdminSettings
        visible={adminSettingsVisible}
        onClose={() => setAdminSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 5,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: THEME.surface,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  activeTabButton: {
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
    borderWidth: 1,
    borderColor: THEME.accent,
  },
  tabButtonText: {
    color: THEME.textLight,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeTabButtonText: {
    color: THEME.accent,
  },
  sectionContainer: {
    backgroundColor: THEME.surface,
    marginTop: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 15,
  },
  preferencesList: {
    paddingHorizontal: 5,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: 'rgba(167, 93, 93, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: THEME.accent,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    color: THEME.textLight,
    fontSize: 14,
    fontStyle: 'italic',
  },
  reviewsContainer: {
    marginHorizontal: 15,
    marginTop: 15,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  reviewsSubtitle: {
    fontSize: 14,
    color: THEME.textLight,
    marginBottom: 15,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  writeReviewText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  appVersion: {
    fontSize: 12,
    color: THEME.textLight,
    marginBottom: 5,
  },
  appCopyright: {
    fontSize: 12,
    color: THEME.textLight,
  },
});