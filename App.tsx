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
import { getUserSession, saveUserSession, clearUserSession } from './src/services/auth-persistence';

// RevenueCat API Keys - Replace with your actual keys
const REVENUECAT_IOS_KEY = 'appl_PpDkMoSSuzCvuUuGACErzjreTvb';
const REVENUECAT_ANDROID_KEY = 'goog_YOUR_ANDROID_KEY_HERE';

// Main App Component
function AppContent() {
  const dispatch = useDispatch();

  // Initialize RevenueCat and clear old notifications
  useEffect(() => {
    const initApp = async () => {
      // Clear old SecureStore sessions from previous app versions
      // This prevents "ghost accounts" from persisting across major updates
      const APP_VERSION = '1.18'; // Match version in app.json
      const LAST_VERSION_KEY = 'lastAppVersion';
      
      try {
        const lastVersion = await AsyncStorage.getItem(LAST_VERSION_KEY);
        if (lastVersion !== APP_VERSION) {
          console.log(`🧹 App version changed (${lastVersion} → ${APP_VERSION}), clearing old sessions`);
          await clearUserSession();
          await AsyncStorage.setItem(LAST_VERSION_KEY, APP_VERSION);
          console.log('✅ Old sessions cleared for fresh start');
        }
      } catch (error) {
        console.error('❌ Failed to check app version:', error);
      }
      
      // Check SecureStore for saved session EARLY (before Firebase Auth fires)
      // This gives us a reliable restore mechanism independent of Firebase
      setTimeout(async () => {
        try {
          const savedSession = await getUserSession();
          
          if (savedSession) {
            console.log('🔍 Found saved session in SecureStore:', savedSession.userId);
            
            // Check if Firebase Auth has restored the user
            const currentUser = auth.currentUser;
            if (!currentUser) {
              console.log('🔧 Firebase Auth failed to restore - ACTIVATING SecureStore session');
              
              // Manually dispatch the user to Redux
              dispatch(setFirebaseUser({
                uid: savedSession.userId,
                email: savedSession.email,
                displayName: null,
              }));
              
              // Also log in to RevenueCat with the saved user
              try {
                await Purchases.logIn(savedSession.userId);
                console.log('✅ RevenueCat logged in with SecureStore user');
              } catch (error: any) {
                if (!(__DEV__ && error.message?.includes('no singleton instance'))) {
                  console.error('❌ Failed to log in RevenueCat:', error);
                }
              }
              
              console.log('✅ User session restored from SecureStore');
            } else {
              console.log('✅ Firebase Auth already restored user - SecureStore backup not needed');
            }
          } else {
            console.log('ℹ️ No saved session found (user not logged in)');
          }
        } catch (error) {
          console.error('❌ Failed to check SecureStore session:', error);
        }
      }, 800); // Check after 800ms - before navigation initializes
      
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
                
                // Save user session to SecureStore for reliable persistence
                try {
                  await saveUserSession(user.uid, user.email || '');
                  console.log('💾 User session saved to SecureStore');
                } catch (error) {
                  console.error('❌ Failed to save user session to SecureStore:', error);
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
                
                // Clear saved session from SecureStore
                try {
                  await clearUserSession();
                  console.log('🗑️ User session cleared from SecureStore');
                } catch (error) {
                  console.error('❌ Failed to clear user session from SecureStore:', error);
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