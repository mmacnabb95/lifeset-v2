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
import { auth } from './src/services/firebase/config';
// CHANGE: Import the correct actions from your auth slice
import { setFirebaseUser, clearFirebaseUser, markAuthInitialized } from './src/redux/features/auth/slice';

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
      
      // WORKAROUND: Check if we have a manually saved session
      // If Firebase Auth fails to restore, we'll restore manually after a delay
      setTimeout(async () => {
        try {
          const savedUserId = await AsyncStorage.getItem('firebase_user_id');
          const savedEmail = await AsyncStorage.getItem('firebase_user_email');
          
          if (savedUserId && savedEmail) {
            console.log('🔍 Found manual session backup:', savedUserId);
            
            // Check if Firebase Auth has restored the user
            const currentUser = auth.currentUser;
            if (!currentUser) {
              console.log('⚠️ Firebase Auth failed to restore - using manual backup');
              // Manually dispatch the user to Redux
              dispatch(setFirebaseUser({
                uid: savedUserId,
                email: savedEmail,
                displayName: null,
              }));
              console.log('✅ Manually restored user session from AsyncStorage');
            } else {
              console.log('✅ Firebase Auth already restored user - manual backup not needed');
            }
          } else {
            console.log('ℹ️ No manual session backup found (user not logged in)');
          }
        } catch (error) {
          console.error('❌ Failed to check manual session backup:', error);
        }
      }, 1000); // Wait 1 second for Firebase Auth to try restoring first
      
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
  }, [dispatch]);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const startTime = Date.now();
    let isFirstCallback = true;
    console.log('🔧 [0ms] Setting up Firebase auth listener...');
    console.log('🔧 Auth listener mounted at:', new Date().toISOString());
    
    let callbackCount = 0;
    
    const unsubscribe = onAuthStateChange(async (user) => {
      callbackCount++;
      const elapsed = Date.now() - startTime;
      const timestamp = new Date().toISOString();
      
      console.log(`\n========== AUTH CALLBACK #${callbackCount} [${elapsed}ms] ==========`);
      console.log('Timestamp:', timestamp);
      console.log('User:', user ? user.uid : 'NULL');
      console.log('Email:', user ? user.email : 'N/A');
      console.log('Is First Callback:', isFirstCallback);
      console.log('Callback Count:', callbackCount);
      
      // CRITICAL FIX: Ignore the first NULL callback
      // Firebase Auth fires with NULL immediately while loading from AsyncStorage
      // Then fires again with the actual user once persistence loads
      if (isFirstCallback && !user && elapsed < 2000) {
        console.log('⏭️ IGNORING first NULL callback (callback #' + callbackCount + ') - waiting for persistence to load');
        console.log('⏳ Expecting second callback with user data within a few seconds...');
        isFirstCallback = false;
        // Mark auth as initialized so app doesn't get stuck
        // But DON'T clear user state (wait for second callback with real user)
        dispatch(markAuthInitialized());
        console.log('✅ markAuthInitialized dispatched - waiting for real auth state...');
        console.log('========== END AUTH CALLBACK (IGNORED) ==========\n');
        
        // DIAGNOSTIC: Set a timer to check if we ever get the second callback
        setTimeout(() => {
          if (!auth.currentUser) {
            console.log('🚨 WARNING: 5 seconds passed and still no user! Firebase Auth persistence may have failed.');
            console.log('🚨 Current auth state:', auth.currentUser ? 'USER EXISTS' : 'NULL');
          } else {
            console.log('✅ User was restored within 5 seconds:', auth.currentUser.uid);
          }
        }, 5000);
        
        return;
      }
      
      isFirstCallback = false;
      
      if (user) {
        console.log(`✅ [${elapsed}ms] User authenticated on app start:`, user.uid);
        console.log('📝 Dispatching setFirebaseUser to Redux...');
        
        // WORKAROUND: Manually save user ID to AsyncStorage as backup
        // This ensures we can restore session even if Firebase persistence fails
        try {
          await AsyncStorage.setItem('firebase_user_id', user.uid);
          await AsyncStorage.setItem('firebase_user_email', user.email || '');
          console.log('💾 Saved user session to AsyncStorage manually');
        } catch (error) {
          console.error('❌ Failed to save user session manually:', error);
        }
        
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
        
        // Clear manual session storage
        try {
          await AsyncStorage.removeItem('firebase_user_id');
          await AsyncStorage.removeItem('firebase_user_email');
          console.log('💾 Cleared manual user session from AsyncStorage');
        } catch (error) {
          console.error('❌ Failed to clear manual session:', error);
        }
        
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