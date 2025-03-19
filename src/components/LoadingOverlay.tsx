import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  useSharedValue,
  withDelay
} from 'react-native-reanimated';
import { BookOpen } from 'lucide-react-native';

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

interface LoadingOverlayProps {
  message?: string;
  showSpinner?: boolean;
  transparent?: boolean;
}

export default function LoadingOverlay({ 
  message = 'Loading...', 
  showSpinner = true,
  transparent = false
}: LoadingOverlayProps) {
  // Animation for the book icon
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    // Rotate animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );

    // Pulse animation
    scale.value = withRepeat(
      withSequence(
        withDelay(500, withTiming(1.2, { duration: 1000 })),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ]
    };
  });

  return (
    <View style={[
      styles.container,
      transparent && styles.transparentContainer
    ]}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <BookOpen size={50} color={THEME.accent} />
      </Animated.View>
      
      {showSpinner && (
        <ActivityIndicator 
          size="large" 
          color={THEME.accent} 
          style={styles.spinner}
        />
      )}
      
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
    zIndex: 1000,
  },
  transparentContainer: {
    backgroundColor: 'rgba(249, 245, 235, 0.9)',
  },
  iconContainer: {
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: THEME.text,
    textAlign: 'center',
    maxWidth: '80%',
  },
});