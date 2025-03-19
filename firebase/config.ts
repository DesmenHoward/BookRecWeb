import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);

// Configure Firestore with persistence enabled
const firestore = getFirestore(app);

// Enable offline persistence for web
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(firestore).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Persistence disabled: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Persistence not supported by browser');
    }
  });
}

// Initialize Storage
const storage = getStorage(app);

// Export initialized services
export { app, auth, firestore, storage };