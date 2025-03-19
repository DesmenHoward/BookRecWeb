import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform,
  Animated,
  Easing
} from 'react-native';
import { TriangleAlert, Eye } from 'lucide-react-native';

// Theme colors
const THEME = {
  primary: '#7D6E83',
  accent: '#A75D5D',
  background: '#F9F5EB',
  surface: '#EFE3D0',
  text: '#4F4557',
  textLight: '#7D6E83',
  border: '#D0B8A8',
  info: '#6B9080',
  warning: '#DDA15E',
  error: '#BC6C25'
};

interface SpoilerBlockProps {
  content: React.ReactNode;
  warningText?: string;
  spoilerType?: 'plot' | 'ending' | 'sensitive' | 'general';
  blurIntensity?: number;
}

export default function SpoilerBlock({ 
  content, 
  warningText = 'Spoiler Content',
  spoilerType = 'general',
  blurIntensity = 5
}: SpoilerBlockProps) {
  const [revealed, setRevealed] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  
  const toggleReveal = () => {
    if (!revealed) {
      // Animate reveal
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate hide
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
    
    setRevealed(!revealed);
  };
  
  // Get spoiler type styling and text
  const getSpoilerTypeInfo = () => {
    switch (spoilerType) {
      case 'plot':
        return {
          color: THEME.warning,
          text: 'Plot Spoiler',
          icon: <TriangleAlert size={16} color={THEME.warning} />
        };
      case 'ending':
        return {
          color: THEME.error,
          text: 'Ending Spoiler',
          icon: <TriangleAlert size={16} color={THEME.error} />
        };
      case 'sensitive':
        return {
          color: THEME.primary,
          text: 'Sensitive Content',
          icon: <TriangleAlert size={16} color={THEME.primary} />
        };
      case 'general':
      default:
        return {
          color: THEME.info,
          text: 'Spoiler',
          icon: <TriangleAlert size={16} color={THEME.info} />
        };
    }
  };
  
  const typeInfo = getSpoilerTypeInfo();
  
  // Animated styles
  const blurRadius = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [blurIntensity, 0]
  });
  
  const overlayOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 0]
  });
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={toggleReveal}
        style={styles.spoilerContainer}
      >
        {/* Content (blurred when not revealed) */}
        <Animated.View 
          style={[
            styles.contentContainer,
            { 
              filter: Platform.OS === 'web' ? `blur(${blurRadius}px)` : undefined,
            }
          ]}
        >
          {content}
        </Animated.View>
        
        {/* Overlay (visible when not revealed) */}
        <Animated.View 
          style={[
            styles.overlay,
            { 
              opacity: overlayOpacity,
              backgroundColor: revealed ? 'transparent' : THEME.surface,
              borderColor: typeInfo.color,
            }
          ]}
        >
          {!revealed && (
            <View style={styles.warningContainer}>
              <View style={styles.spoilerTypeContainer}>
                {typeInfo.icon}
                <Text style={[styles.spoilerTypeText, { color: typeInfo.color }]}>
                  {typeInfo.text}
                </Text>
              </View>
              
              <Text style={styles.warningText}>{warningText}</Text>
              
              <View style={styles.revealButton}>
                <Eye size={16} color="white" />
                <Text style={styles.revealButtonText}>Tap to reveal</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  spoilerContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  contentContainer: {
    backgroundColor: THEME.background,
    padding: 15,
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  warningContainer: {
    alignItems: 'center',
    padding: 15,
  },
  spoilerTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  spoilerTypeText: {
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  warningText: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accent,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  revealButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
});