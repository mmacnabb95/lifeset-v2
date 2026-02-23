// Account Deletion Service
// Deletes all user data from Firestore and Firebase Auth

import { 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  writeBatch 
} from 'firebase/firestore';
import { deleteUser, User } from 'firebase/auth';
import { db, auth } from './config';
import Purchases from 'react-native-purchases';
import { clearUserSession } from '../auth-persistence';

/**
 * Delete all documents in a collection using batches
 */
const deleteCollection = async (collectionRef: any, batchSize: number = 500) => {
  let batch = writeBatch(db);
  let count = 0;
  let totalDeleted = 0;

  const snapshot = await getDocs(collectionRef);
  
  for (const docSnapshot of snapshot.docs) {
    if (count >= batchSize) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
    batch.delete(docSnapshot.ref);
    count++;
    totalDeleted++;
  }

  if (count > 0) {
    await batch.commit();
  }

  return totalDeleted;
};

/**
 * Delete all user data from Firestore subcollections
 */
const deleteUserSubcollections = async (userId: string) => {
  // List of subcollections to delete
  const subcollections = [
    'habits',
    'completions',
    'streaks',
    'journal_entries',
    'journal',
    'meals',
    'water',
    'nutrition',
    'workouts',
    'workout_progress',
    'xp',
    'meditation_sessions',
    'exercise_records',
  ];

  // Delete all documents in each subcollection
  for (const subcollection of subcollections) {
    try {
      const subcollectionRef = collection(db, 'users', userId, subcollection);
      const deleted = await deleteCollection(subcollectionRef);
      console.log(`Deleted ${deleted} documents from ${subcollection}`);
    } catch (error) {
      console.error(`Error deleting ${subcollection}:`, error);
      // Continue with other subcollections even if one fails
    }
  }

  // Delete user's custom workout plans
  try {
    const workoutPlansRef = collection(db, 'workoutPlans');
    const userPlansQuery = query(workoutPlansRef, where('userId', '==', userId));
    const deleted = await deleteCollection(userPlansQuery);
    console.log(`Deleted ${deleted} workout plans`);
  } catch (error) {
    console.error('Error deleting workout plans:', error);
  }

  // Delete user's workout plan progress
  try {
    const progressRef = collection(db, 'workoutPlanProgress');
    const userProgressQuery = query(progressRef, where('userId', '==', userId));
    const deleted = await deleteCollection(userProgressQuery);
    console.log(`Deleted ${deleted} workout progress records`);
  } catch (error) {
    console.error('Error deleting workout progress:', error);
  }

  // Delete the main user document
  try {
    await deleteDoc(doc(db, 'users', userId));
    console.log('Deleted main user document');
  } catch (error) {
    console.error('Error deleting user document:', error);
    throw error;
  }
};

/**
 * Delete user account completely
 * This deletes:
 * - All Firestore data (habits, journal, workouts, etc.)
 * - Firebase Auth account
 * - RevenueCat user data
 * - SecureStore session
 */
export const deleteAccount = async (userId: string): Promise<void> => {
  try {
    console.log('🗑️ Starting account deletion for user:', userId);

    // 1. Delete all Firestore data
    console.log('🗑️ Deleting Firestore data...');
    await deleteUserSubcollections(userId);
    console.log('✅ Firestore data deleted');

    // 2. Handle RevenueCat subscription
    // Note: We log out from RevenueCat, but subscriptions are managed by Apple/Google
    // Users must cancel subscriptions through their device settings (Settings > Apple ID > Subscriptions)
    try {
      console.log('🗑️ Logging out from RevenueCat...');
      await Purchases.logOut();
      console.log('✅ RevenueCat user logged out');
      console.log('⚠️ Note: Active subscriptions must be cancelled through device settings');
    } catch (error) {
      console.error('⚠️ Error logging out from RevenueCat (non-critical):', error);
      // Continue even if RevenueCat logout fails
    }

    // 3. Clear SecureStore session
    try {
      console.log('🗑️ Clearing SecureStore session...');
      await clearUserSession();
      console.log('✅ SecureStore cleared');
    } catch (error) {
      console.error('⚠️ Error clearing SecureStore (non-critical):', error);
    }

    // 4. Delete Firebase Auth account (must be last)
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      console.log('🗑️ Deleting Firebase Auth account...');
      await deleteUser(currentUser);
      console.log('✅ Firebase Auth account deleted');
    } else {
      console.warn('⚠️ Current user does not match userId, skipping Auth deletion');
    }

    console.log('✅ Account deletion completed successfully');
  } catch (error: any) {
    console.error('❌ Account deletion error:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security, please log out and log back in before deleting your account.');
    }
    
    throw new Error(error.message || 'Failed to delete account. Please try again.');
  }
};

