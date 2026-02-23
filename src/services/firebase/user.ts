// Firebase User Profile Service
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
  profilePictureUrl?: string; // Firebase Storage URL for profile picture
  lastAllHabitsCompleteBonusDate?: string; // YYYY-MM-DD - Track when all-habits bonus was last awarded
  hasCompletedOnboarding?: boolean; // Track if user has seen onboarding
  hasSeenTutorial?: boolean; // Track if user has seen the interactive tutorial
  hasSeenWidgetPrompt?: boolean; // Track if user has seen the widget prompt
  lastActiveDate?: string;
  createdAt?: any;
  updatedAt?: any;
  // Multi-tenant organisation fields (optional, backward compatible)
  organisationId?: string | null;
  role?: "member" | "staff" | "admin" | "employee";
  mode?: string; // Derived from organisation.type
  // Grace period fields (for admin-initiated removal)
  removedAt?: any; // Timestamp when admin removed user
  gracePeriodExpiresAt?: any; // Timestamp when grace period ends (7 days after removal)
  removalType?: "admin" | "user"; // Track who initiated the removal
  // CRM fields (for organisation members)
  fullName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

/**
 * Get user profile data
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw new Error('Failed to get user profile');
  }
};

/**
 * Create or update user profile
 */
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    throw new Error('Failed to update user profile');
  }
};

/**
 * Create initial user profile
 */
export const createUserProfile = async (userId: string, email: string, username: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      uid: userId,
      email,
      username,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Create user profile error:', error);
    throw new Error('Failed to create user profile');
  }
};

/**
 * Listen to user profile changes in real-time
 */
export const subscribeToUserProfile = (
  userId: string,
  callback: (profile: UserProfile | null) => void
) => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Subscribe to user profile error:', error);
      callback(null);
    }
  );
};

/**
 * Add XP to user profile
 */
export const addXP = async (userId: string, xpAmount: number) => {
  try {
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    const newXP = userProfile.xp + xpAmount;
    const newLevel = calculateLevel(newXP);
    
    await updateUserProfile(userId, {
      xp: newXP,
      level: newLevel,
    });
    
    return { xp: newXP, level: newLevel };
  } catch (error) {
    console.error('Add XP error:', error);
    throw new Error('Failed to add XP');
  }
};

/**
 * Update streak based on activity
 */
export const updateStreak = async (userId: string) => {
  try {
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userProfile.lastActiveDate;
    
    let newStreak = userProfile.streak || 0;
    
    if (lastActive !== today) {
      // Check if last active was yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActive === yesterdayStr) {
        // Continue streak
        newStreak += 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
      
      await updateUserProfile(userId, {
        streak: newStreak,
        lastActiveDate: today,
      });
    }
    
    return newStreak;
  } catch (error) {
    console.error('Update streak error:', error);
    throw new Error('Failed to update streak');
  }
};

/**
 * Calculate level based on XP (simple formula)
 */
const calculateLevel = (xp: number): number => {
  // Every 1000 XP = 1 level
  return Math.floor(xp / 1000) + 1;
};

/**
 * Mark onboarding as completed for a user
 */
export const setOnboardingCompleted = async (userId: string) => {
  try {
    await updateUserProfile(userId, {
      hasCompletedOnboarding: true,
    });
  } catch (error) {
    console.error('Set onboarding completed error:', error);
    throw new Error('Failed to set onboarding completed');
  }
};

/**
 * Check if user has completed onboarding
 */
export const getOnboardingStatus = async (userId: string): Promise<boolean> => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile?.hasCompletedOnboarding || false;
  } catch (error) {
    console.error('Get onboarding status error:', error);
    return false;
  }
};

/**
 * Reset onboarding status (for testing purposes)
 */
export const resetOnboardingStatus = async (userId: string) => {
  try {
    await updateUserProfile(userId, {
      hasCompletedOnboarding: false,
    });
  } catch (error) {
    console.error('Reset onboarding status error:', error);
    throw new Error('Failed to reset onboarding status');
  }
};

