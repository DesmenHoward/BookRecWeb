import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Load env file based on mode
process.env = { ...process.env, ...loadEnv(process.env.NODE_ENV || 'development', process.cwd()) };

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000
  },
  // Define environment variables that should always be available
  define: {
    'process.env.EXPO_PUBLIC_FIREBASE_API_KEY': JSON.stringify('AIzaSyD-4Q9_WPbhsOiUMHIjIBZG65oxbRSX_oQ'),
    'process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify('book-2ad97.firebaseapp.com'),
    'process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify('book-2ad97'),
    'process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify('book-2ad97.firebasestorage.app'),
    'process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify('416616058107'),
    'process.env.EXPO_PUBLIC_FIREBASE_APP_ID': JSON.stringify('1:416616058107:web:3ca1e91de50b29819df45e'),
    'process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY': JSON.stringify('AIzaSyD1uTQuJeLUvbj_3L7tN26Ch47gjSeq2Kw')
  }
});