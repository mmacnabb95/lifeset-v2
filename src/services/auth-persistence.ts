/**
 * Auth Persistence using SecureStore
 * 
 * Firebase Auth's AsyncStorage persistence doesn't work reliably in production builds.
 * This service uses Expo SecureStore (iOS Keychain) for reliable session persistence.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const USER_ID_KEY = 'lifeset_user_id';
const USER_EMAIL_KEY = 'lifeset_user_email';

/**
 * Save user session securely
 */
export const saveUserSession = async (userId: string, email: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Fallback to localStorage for web
      localStorage.setItem(USER_ID_KEY, userId);
      localStorage.setItem(USER_EMAIL_KEY, email);
    } else {
      // Use SecureStore for iOS/Android
      await SecureStore.setItemAsync(USER_ID_KEY, userId);
      await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
    }
    console.log('💾 User session saved to SecureStore:', userId);
  } catch (error) {
    console.error('❌ Failed to save user session:', error);
    throw error;
  }
};

/**
 * Get saved user session
 */
export const getUserSession = async (): Promise<{ userId: string; email: string } | null> => {
  try {
    let userId: string | null;
    let email: string | null;
    
    if (Platform.OS === 'web') {
      userId = localStorage.getItem(USER_ID_KEY);
      email = localStorage.getItem(USER_EMAIL_KEY);
    } else {
      userId = await SecureStore.getItemAsync(USER_ID_KEY);
      email = await SecureStore.getItemAsync(USER_EMAIL_KEY);
    }
    
    if (userId && email) {
      console.log('🔍 Found saved session in SecureStore:', userId);
      return { userId, email };
    }
    
    console.log('ℹ️ No saved session found in SecureStore');
    return null;
  } catch (error) {
    console.error('❌ Failed to get user session:', error);
    return null;
  }
};

/**
 * Clear saved user session
 */
export const clearUserSession = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(USER_EMAIL_KEY);
    } else {
      await SecureStore.deleteItemAsync(USER_ID_KEY);
      await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
    }
    console.log('🗑️ User session cleared from SecureStore');
  } catch (error) {
    console.error('❌ Failed to clear user session:', error);
  }
};

