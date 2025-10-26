import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { Platform } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native'; // Removed - handled in Navigation component
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Purchases from 'react-native-purchases';

// Import your store
import { store } from './src/redux/stores/store';

// Import your navigation
import { Navigation } from './src/navigation/navigation';

// Import Firebase auth listener
import { onAuthStateChange } from './src/services/firebase/auth';
// CHANGE: Import the correct actions from your auth slice
import { setFirebaseUser, clearFirebaseUser } from './src/redux/features/auth/slice';

// RevenueCat API Keys - Replace with your actual keys
const REVENUECAT_IOS_KEY = 'appl_PpDkMoSSuzCvuUuGACErzjreTvb';
const REVENUECAT_ANDROID_KEY = 'goog_YOUR_ANDROID_KEY_HERE';

// Main App Component
function AppContent() {
  const dispatch = useDispatch();

  // Initialize RevenueCat
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
        await Purchases.configure({ apiKey });
        console.log('RevenueCat initialized successfully');
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      }
    };

    initRevenueCat();
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        
        // Set RevenueCat user ID to Firebase UID
        try {
          await Purchases.logIn(user.uid);
          console.log('RevenueCat user logged in:', user.uid);
        } catch (error) {
          console.error('Failed to log in RevenueCat user:', error);
        }
        
        // User is signed in
        dispatch(setFirebaseUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }));
      } else {
        console.log('User signed out');
        
        // Log out RevenueCat user
        try {
          await Purchases.logOut();
          console.log('RevenueCat user logged out');
        } catch (error) {
          console.error('Failed to log out RevenueCat user:', error);
        }
        
        // User is signed out
        dispatch(clearFirebaseUser());
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up Firebase auth listener');
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Navigation />
    </SafeAreaProvider>
  );
}

// Wrap with Redux Provider
export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}