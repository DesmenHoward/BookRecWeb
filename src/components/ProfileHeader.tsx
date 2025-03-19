import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { CreditCard as Edit, Camera, MapPin, Link, Award } from 'lucide-react-native';
import { useUserProfileStore } from '../store/userProfileStore';
import { useBookStore } from '../store/bookStore';

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

interface ProfileHeaderProps {
  onEditProfile: () => void;
  onChangePhoto: () => void;
}

export default function ProfileHeader({ onEditProfile, onChangePhoto }: ProfileHeaderProps) {
  const { profile } = useUserProfileStore();
  const { userNickname } = useBookStore();
  
  return (
    <View style={styles.container}>
      <View style={styles.coverPhoto}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={onEditProfile}
        >
          <Edit size={18} color="white" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.profilePhotoContainer}>
        <Image 
          source={{ uri: profile.profilePicture }} 
          style={styles.profilePhoto} 
        />
        <TouchableOpacity 
          style={styles.changePhotoButton}
          onPress={onChangePhoto}
        >
          <Camera size={18} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.userInfoContainer}>
        <Text style={styles.displayName}>{profile.displayName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        
        {userNickname && (
          <View style={styles.nicknameContainer}>
            <Award size={16} color={THEME.accent} style={styles.nicknameIcon} />
            <Text style={styles.nickname}>{userNickname}</Text>
          </View>
        )}
        
        <Text style={styles.bio}>{profile.bio}</Text>
        
        <View style={styles.detailsContainer}>
          {profile.location && (
            <View style={styles.detailItem}>
              <MapPin size={16} color={THEME.textLight} />
              <Text style={styles.detailText}>{profile.location}</Text>
            </View>
          )}
          
          {profile.website && (
            <View style={styles.detailItem}>
              <Link size={16} color={THEME.textLight} />
              <Text style={styles.detailText}>{profile.website}</Text>
            </View>
          )}
          
          <Text style={styles.joinDate}>Joined {profile.joinDate}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  coverPhoto: {
    height: 60,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 93, 93, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  profilePhotoContainer: {
    position: 'relative',
    marginTop: -50,
    marginLeft: 20,
    width: 100,
    height: 100,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: THEME.surface,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: THEME.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.surface,
  },
  userInfoContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    color: THEME.textLight,
    marginBottom: 8,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  nicknameIcon: {
    marginRight: 6,
  },
  nickname: {
    color: THEME.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  bio: {
    fontSize: 16,
    color: THEME.text,
    lineHeight: 22,
    marginBottom: 15,
  },
  detailsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: THEME.textLight,
    marginLeft: 8,
    fontSize: 14,
  },
  joinDate: {
    color: THEME.textLight,
    fontSize: 14,
    marginTop: 5,
  },
});