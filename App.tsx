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

// Import notification helper to clear old notifications
import { clearAllNotifications } from './src/services/notifications/habitReminder';
import AsyncStorage from '@react-native-async-storage/async-storage';

// RevenueCat API Keys - Replace with your actual keys
const REVENUECAT_IOS_KEY = 'appl_PpDkMoSSuzCvuUuGACErzjreTvb';
const REVENUECAT_ANDROID_KEY = 'goog_YOUR_ANDROID_KEY_HERE';

// Main App Component
function AppContent() {
  const dispatch = useDispatch();

  // Initialize RevenueCat and clear old notifications
  useEffect(() => {
    const initApp = async () => {
      // Test AsyncStorage to verify it's working
      try {
        await AsyncStorage.setItem('test_key', 'test_value');
        const testValue = await AsyncStorage.getItem('test_key');
        console.log('✅ AsyncStorage test:', testValue === 'test_value' ? 'WORKING' : 'FAILED');
      } catch (error) {
        console.error('❌ AsyncStorage test FAILED:', error);
      }
      
      // Initialize RevenueCat
      try {
        const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
        await Purchases.configure({ apiKey });
        console.log('✅ RevenueCat initialized successfully');
      } catch (error: any) {
        // Expected in Expo Go - RevenueCat requires native build
        if (__DEV__ && error.message?.includes('no singleton instance')) {
          console.log('🔧 Development mode: RevenueCat unavailable in Expo Go (will work in production build)');
        } else {
          console.error('❌ Failed to initialize RevenueCat:', error);
        }
      }

      // Clear any stale notifications from previous app versions or old bundle IDs
      try {
        await clearAllNotifications();
        console.log('✅ Old notifications cleared on app launch');
      } catch (error) {
        console.error('❌ Failed to clear old notifications:', error);
      }
    };

    initApp();
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const startTime = Date.now();
    console.log('🔧 [0ms] Setting up Firebase auth listener...');
    console.log('🔧 Auth listener mounted at:', new Date().toISOString());
    
    const unsubscribe = onAuthStateChange(async (user) => {
      const elapsed = Date.now() - startTime;
      const timestamp = new Date().toISOString();
      
      console.log(`\n========== AUTH STATE CHANGE [${elapsed}ms] ==========`);
      console.log('Timestamp:', timestamp);
      console.log('User:', user ? user.uid : 'NULL');
      console.log('Email:', user ? user.email : 'N/A');
      
      if (user) {
        console.log(`✅ [${elapsed}ms] User authenticated on app start:`, user.uid);
        console.log('📝 Dispatching setFirebaseUser to Redux...');
        
        // Set RevenueCat user ID to Firebase UID
        try {
          await Purchases.logIn(user.uid);
          console.log('✅ RevenueCat user logged in:', user.uid);
        } catch (error: any) {
          // Expected in Expo Go development
          if (!(__DEV__ && error.message?.includes('no singleton instance'))) {
            console.error('❌ Failed to log in RevenueCat user:', error);
          }
        }
        
        // User is signed in
        dispatch(setFirebaseUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }));
        console.log('✅ setFirebaseUser dispatched - authInitialized should be TRUE now');
      } else {
        console.log(`⚠️ [${elapsed}ms] No user authenticated (logged out or fresh start)`);
        console.log('📝 Dispatching clearFirebaseUser to Redux...');
        
        // Log out RevenueCat user
        try {
          await Purchases.logOut();
          console.log('✅ RevenueCat user logged out');
        } catch (error: any) {
          // Expected in Expo Go development
          if (!(__DEV__ && error.message?.includes('no singleton instance'))) {
            console.error('❌ Failed to log out RevenueCat user:', error);
          }
        }
        
        // User is signed out
        dispatch(clearFirebaseUser());
        console.log('✅ clearFirebaseUser dispatched - authInitialized should be TRUE now');
      }
      console.log(`========== END AUTH STATE CHANGE ==========\n`);
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