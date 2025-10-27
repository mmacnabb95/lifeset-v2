// Firebase Configuration Template
// Copy this to: lifeset-v2/src/services/firebase/config.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { 
  getAuth,
  initializeAuth, 
  getReactNativePersistence, 
  browserLocalPersistence,
  connectAuthEmulator 
} from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
// Get these values from Firebase Console → Project Settings → Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyC0J13ZNoc_igOMAJb2-QBfKBRaStpCikQ",
  authDomain: "lifeset-v2.firebaseapp.com",
  projectId: "lifeset-v2",
  storageBucket: "lifeset-v2.firebasestorage.app",
  messagingSenderId: "178817634463",
  appId: "1:178817634463:web:627c56190c9a1a61e252aa",
  measurementId: "G-1GTJ51M4JL" // Optional, for analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);

// Initialize Auth with platform-specific persistence
// Use try-catch in case auth is already initialized (prevents duplicate init error)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: Platform.OS === 'web' 
      ? browserLocalPersistence 
      : getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
} catch (error: any) {
  // If already initialized, just get the existing instance
  if (error.code === 'auth/already-initialized') {
    console.log('⚠️ Auth already initialized, using existing instance');
    auth = getAuth(app);
  } else {
    console.error('❌ Failed to initialize Firebase Auth:', error);
    throw error;
  }
}

export { auth };

export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development (optional)
// Uncomment these lines to use Firebase emulators locally
if (__DEV__) {
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectStorageEmulator(storage, 'localhost', 9199);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;

