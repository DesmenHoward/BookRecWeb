import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
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

interface ProfileStatsProps {
  onPressStats: (statType: 'swiped' | 'favorites' | 'recommendations') => void;
}

export default function ProfileStats({ onPressStats }: ProfileStatsProps) {
  const { swipedBooks, favorites, recommendations } = useBookStore();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => onPressStats('swiped')}
      >
        <Text style={styles.statNumber}>{swipedBooks.length}</Text>
        <Text style={styles.statLabel}>Books{'\n'}Swiped</Text>
      </TouchableOpacity>
      
      <View style={styles.statDivider} />
      
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => onPressStats('favorites')}
      >
        <Text style={styles.statNumber}>{favorites.length}</Text>
        <Text style={styles.statLabel}>Favorites</Text>
      </TouchableOpacity>
      
      <View style={styles.statDivider} />
      
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => onPressStats('recommendations')}
      >
        <Text style={styles.statNumber}>{recommendations.length}</Text>
        <Text style={[styles.statLabel, styles.recommendationsLabel]}>Recommendations</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: THEME.surface,
    marginTop: 15,
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
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: THEME.border,
    marginHorizontal: 15,
    alignSelf: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.accent,
    marginBottom: 10,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: THEME.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  recommendationsLabel: {
    paddingHorizontal: 5, // Add horizontal padding specifically for "Recommendations"
    marginTop: Platform.select({
      android: 2, // Extra top margin for Android
      default: 0,
    }),
  },
});