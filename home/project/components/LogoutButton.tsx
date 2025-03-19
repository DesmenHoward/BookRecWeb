import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';

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

interface LogoutButtonProps {
  variant?: 'icon' | 'text' | 'full';
}

export default function LogoutButton({ variant = 'full' }: LogoutButtonProps) {
  const { logout } = useAuthStore();
  const router = useRouter();
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Reset navigation state and redirect to login
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to logout. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  if (variant === 'icon') {
    return (
      <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
        <LogOut size={24} color={THEME.accent} />
      </TouchableOpacity>
    );
  }
  
  if (variant === 'text') {
    return (
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.textButton}>Logout</Text>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity style={styles.fullButton} onPress={handleLogout}>
      <LogOut size={20} color="white" style={styles.buttonIcon} />
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
  textButton: {
    color: THEME.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullButton: {
    backgroundColor: THEME.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});