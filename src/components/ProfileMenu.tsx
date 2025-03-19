import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { Settings, MessageCircle, LogOut } from 'lucide-react-native';
import LogoutButton from './LogoutButton';

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

interface ProfileMenuProps {
  onPressMenuItem: (menuItem: string) => void;
}

export default function ProfileMenu({ onPressMenuItem }: ProfileMenuProps) {
  const handleContactPress = () => {
    Alert.alert(
      'Contact Us',
      'For any questions, concerns, or reports please contact, BookRecHelp@Outlook.com'
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => onPressMenuItem('settings')}
      >
        <Settings size={20} color={THEME.textLight} />
        <Text style={styles.menuText}>Account Settings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={handleContactPress}
      >
        <MessageCircle size={20} color={THEME.textLight} />
        <Text style={styles.menuText}>Contact Us</Text>
      </TouchableOpacity>
      
      <View style={styles.logoutContainer}>
        <LogoutButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  menuText: {
    fontSize: 16,
    color: THEME.text,
    marginLeft: 15,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
});