import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { FirebaseAuthProvider } from '../components/FirebaseAuthProvider';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={styles.container}>
      <FirebaseAuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              headerShown: false,
              // Prevent going back to tabs after logout
              gestureEnabled: false 
            }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              // Prevent going back to login after auth
              gestureEnabled: false 
            }} 
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </FirebaseAuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});