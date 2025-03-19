import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';

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

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  rightComponent?: React.ReactNode;
}

export default function Header({ 
  title, 
  showBackButton = false, 
  showSearch = true,
  rightComponent 
}: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={THEME.text} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rightContainer}>
        {rightComponent ? (
          rightComponent
        ) : showSearch ? (
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={() => router.push('/search')}
          >
            <Search size={22} color={THEME.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    backgroundColor: THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  leftContainer: {
    width: 40,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
  },
  backButton: {
    padding: 5,
  },
  searchButton: {
    padding: 5,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
});