// Firebase Auth Service
// Copy this to: lifeset-v2/src/services/firebase/auth.ts

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import * as AppleAuthentication from 'expo-apple-authentication';

/**
 * Sign up a new user
 */
export const signUp = async (email: string, password: string, username: string) => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with username
    await updateProfile(user, { displayName: username });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      username: username,
      createdAt: serverTimestamp(),
      xp: 0,
      level: 1,
    });

    return user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in existing user
 */
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign out current user
 */
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Sign in with Apple
 */
export const signInWithApple = async () => {
  try {
    // Check if Apple Authentication is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Sign In is not available on this device');
    }

    // Request Apple authentication
    const appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Create Firebase credential from Apple credential
    const { identityToken, authorizationCode } = appleCredential;
    if (!identityToken) {
      throw new Error('Apple Sign In failed - no identity token');
    }

    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: identityToken,
      rawNonce: authorizationCode || undefined,
    });

    // Sign in to Firebase with Apple credential
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    // Check if user document exists, create if not
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // New user - create profile
      const displayName = appleCredential.fullName
        ? `${appleCredential.fullName.givenName || ''} ${appleCredential.fullName.familyName || ''}`.trim()
        : user.email?.split('@')[0] || 'User';

      await setDoc(userDocRef, {
        email: user.email || appleCredential.email || '',
        username: displayName,
        createdAt: serverTimestamp(),
        xp: 0,
        level: 1,
      });

      // Update Firebase profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
    }

    return user;
  } catch (error: any) {
    console.error('Apple Sign In error:', error);
    
    // Handle user cancellation gracefully
    if (error.code === 'ERR_CANCELED' || error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Sign in was cancelled');
    }
    
    throw new Error(error.message || 'Failed to sign in with Apple');
  }
};

/**
 * Get user profile data
 */
export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw new Error('Failed to get user profile');
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  console.log('🔧 Registering Firebase onAuthStateChanged listener');
  console.log('🔧 Auth persistence enabled:', auth.config.persistence);
  
  return auth.onAuthStateChanged((user) => {
    console.log('🔔 onAuthStateChanged fired - User:', user ? user.uid : 'NULL');
    callback(user);
  });
};

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    default:
      return 'Authentication error. Please try again';
  }
};

