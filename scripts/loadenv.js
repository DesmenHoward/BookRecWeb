const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

// Default environment variables
const defaultEnv = `# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyD-4Q9_WPbhsOiUMHIjIBZG65oxbRSX_oQ
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=book-2ad97.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=book-2ad97
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=book-2ad97.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=416616058107
EXPO_PUBLIC_FIREBASE_APP_ID=1:416616058107:web:3ca1e91de50b29819df45e

# Google Books API
EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY=AIzaSyD1uTQuJeLUvbj_3L7tN26Ch47gjSeq2Kw`;

// Create .env file if it doesn't exist
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, defaultEnv);
  console.log('.env file created with default configuration');
} else {
  console.log('.env file already exists');
}