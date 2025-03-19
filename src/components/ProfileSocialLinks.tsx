import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { Instagram, BookOpen } from 'lucide-react-native';
import { useUserProfileStore } from '../store/userProfileStore';
import XIcon from './icons/XIcon';

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

export default function ProfileSocialLinks() {
  const { profile } = useUserProfileStore();
  
  // Early return if profile or socialLinks is not initialized
  if (!profile || !profile.socialLinks) {
    return null;
  }

  const { twitter = '', instagram = '', goodreads = '' } = profile.socialLinks;
  
  const openLink = (type: 'twitter' | 'instagram' | 'goodreads') => {
    let url = '';
    
    switch (type) {
      case 'twitter':
        if (twitter) {
          url = `https://x.com/${twitter.replace('@', '')}`;
        }
        break;
      case 'instagram':
        if (instagram) {
          url = `https://instagram.com/${instagram.replace('@', '')}`;
        }
        break;
      case 'goodreads':
        if (goodreads) {
          url = `https://goodreads.com/${goodreads}`;
        }
        break;
    }
    
    if (url) {
      Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
    }
  };
  
  // Only render the component if there are social links to display
  if (!twitter && !instagram && !goodreads) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Connect</Text>
      
      <View style={styles.socialLinksContainer}>
        {twitter && (
          <TouchableOpacity 
            style={styles.socialLink}
            onPress={() => openLink('twitter')}
          >
            <XIcon size={20} color="#000000" />
            <Text style={styles.socialLinkText}>@{twitter.replace('@', '')}</Text>
          </TouchableOpacity>
        )}
        
        {instagram && (
          <TouchableOpacity 
            style={styles.socialLink}
            onPress={() => openLink('instagram')}
          >
            <Instagram size={20} color="#E1306C" />
            <Text style={styles.socialLinkText}>{instagram}</Text>
          </TouchableOpacity>
        )}
        
        {goodreads && (
          <TouchableOpacity 
            style={styles.socialLink}
            onPress={() => openLink('goodreads')}
          >
            <BookOpen size={20} color="#553B08" />
            <Text style={styles.socialLinkText}>goodreads.com/{goodreads}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  socialLinksContainer: {
    gap: 15,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialLinkText: {
    color: THEME.textLight,
    marginLeft: 10,
    fontSize: 16,
  },
});