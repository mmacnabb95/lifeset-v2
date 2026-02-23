// Firebase Habits Service
// Copy this to: lifeset-v2/src/services/firebase/habits.ts

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import moment from 'moment';

export interface Habit {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  category?: string;
  streakTarget?: number; // Target streak in days (optional)
  schedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface HabitCompletion {
  id?: string;
  userId: string;
  habitId: string;
  completedAt: Timestamp;
  date: string; // YYYY-MM-DD format
}

export interface Streak {
  id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string; // YYYY-MM-DD
  updatedAt: Timestamp;
}

/**
 * Create a new habit
 */
export const createHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const habitsRef = collection(db, 'users', habit.userId, 'habits');
    const docRef = await addDoc(habitsRef, {
      ...habit,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Create habit error:', error);
    throw new Error('Failed to create habit');
  }
};

/**
 * Get organisation habits (suggested habits for members)
 */
export const getOrganisationHabits = async (
  organisationId: string
): Promise<{ id: string; name: string; description?: string; category?: string; streakTarget?: number; schedule: Habit['schedule'] }[]> => {
  try {
    const q = query(
      collection(db, 'organisationHabits'),
      where('organisationId', '==', organisationId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as { id: string; name: string; description?: string; category?: string; streakTarget?: number; schedule: Habit['schedule'] }[];
  } catch (error) {
    console.error('Get organisation habits error:', error);
    return [];
  }
};

/**
 * Get all habits for a user
 */
export const getHabits = async (userId: string): Promise<Habit[]> => {
  try {
    const habitsRef = collection(db, 'users', userId, 'habits');
    const snapshot = await getDocs(habitsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  } catch (error) {
    console.error('Get habits error:', error);
    throw new Error('Failed to get habits');
  }
};

/**
 * Get a single habit
 */
export const getHabit = async (userId: string, habitId: string): Promise<Habit | null> => {
  try {
    const habitDoc = await getDoc(doc(db, 'users', userId, 'habits', habitId));
    if (habitDoc.exists()) {
      return { id: habitDoc.id, ...habitDoc.data() } as Habit;
    }
    return null;
  } catch (error) {
    console.error('Get habit error:', error);
    throw new Error('Failed to get habit');
  }
};

/**
 * Update a habit
 */
export const updateHabit = async (userId: string, habitId: string, updates: Partial<Habit>) => {
  try {
    const habitRef = doc(db, 'users', userId, 'habits', habitId);
    await updateDoc(habitRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update habit error:', error);
    throw new Error('Failed to update habit');
  }
};

/**
 * Delete a habit and all its completions
 */
export const deleteHabit = async (userId: string, habitId: string) => {
  try {
    // Delete the habit document
    await deleteDoc(doc(db, 'users', userId, 'habits', habitId));
    
    // Delete all completion records for this habit
    const completionsRef = collection(db, 'users', userId, 'completions');
    const q = query(completionsRef, where('habitId', '==', habitId));
    const snapshot = await getDocs(q);
    
    // Delete all completion documents
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`Deleted habit ${habitId} and ${snapshot.docs.length} completion records`);
  } catch (error) {
    console.error('Delete habit error:', error);
    throw new Error('Failed to delete habit');
  }
};

/**
 * Complete a habit for a specific date
 */
export const completeHabit = async (userId: string, habitId: string, date?: string) => {
  try {
    const completionDate = date || moment().format('YYYY-MM-DD');
    
    // Check if already completed on this date
    const completionsRef = collection(db, 'users', userId, 'completions');
    const q = query(
      completionsRef,
      where('habitId', '==', habitId),
      where('date', '==', completionDate)
    );
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      throw new Error('Habit already completed today');
    }
    
    // Add completion
    await addDoc(completionsRef, {
      userId,
      habitId,
      completedAt: serverTimestamp(),
      date: completionDate,
    });
    
    // Update streak - add delay and retry to ensure Firestore write has propagated
    // This prevents race condition where updateStreak queries before completion is visible
    // Retry up to 3 times with increasing delays (longer delays for better reliability)
    let retries = 0;
    const maxRetries = 3;
    while (retries < maxRetries) {
      // Longer delays: 500ms, 1000ms, 1500ms to ensure Firestore propagation
      await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1)));
      try {
        await updateStreak(userId);
        break; // Success, exit retry loop
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          console.error('Failed to update streak after retries:', error);
          // Don't throw - completion was successful, streak will update on next completion
        }
      }
    }
  } catch (error) {
    console.error('Complete habit error:', error);
    throw error;
  }
};

/**
 * Uncomplete a habit
 */
export const uncompleteHabit = async (userId: string, habitId: string, date: string) => {
  try {
    const completionsRef = collection(db, 'users', userId, 'completions');
    const q = query(
      completionsRef,
      where('habitId', '==', habitId),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    
    // Delete all completions for this habit on this date
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Update streak
    await updateStreak(userId);
  } catch (error) {
    console.error('Uncomplete habit error:', error);
    throw new Error('Failed to uncomplete habit');
  }
};

/**
 * Get habit completions for a date range
 */
export const getCompletions = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<HabitCompletion[]> => {
  try {
    const completionsRef = collection(db, 'users', userId, 'completions');
    const q = query(
      completionsRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HabitCompletion));
  } catch (error) {
    console.error('Get completions error:', error);
    throw new Error('Failed to get completions');
  }
};

/**
 * Calculate completion percentage for a date
 */
export const calculateCompletionPercentage = async (userId: string, date: string): Promise<number> => {
  try {
    // Get all habits
    const allHabits = await getHabits(userId);
    
    // Filter to only habits that existed on this date
    const habitsOnDate = allHabits.filter(habit => {
      if (!habit.createdAt) return true; // Include habits without creation date
      const habitCreatedDate = moment(habit.createdAt.toDate()).format('YYYY-MM-DD');
      return habitCreatedDate <= date; // Only include if created on or before this date
    });
    
    // Get habits scheduled for this day of the week
    const dayName = moment(date).format('dddd').toLowerCase() as keyof Habit['schedule'];
    const scheduledHabits = habitsOnDate.filter(h => h.schedule[dayName]);
    
    if (scheduledHabits.length === 0) return 0;
    
    // Get completions for this date
    const completions = await getCompletions(userId, date, date);
    const completedHabitIds = new Set(completions.map(c => c.habitId));
    
    // Calculate percentage
    const completedCount = scheduledHabits.filter(h => completedHabitIds.has(h.id!)).length;
    const percentage = scheduledHabits.length > 0 ? completedCount / scheduledHabits.length : 0;
    
    // Always log for debugging (not just today)
    if (__DEV__) {
      const dayName = moment(date).format('dddd').toLowerCase();
      console.log(`📈 Completion calc for ${date} (${dayName}): ${completedCount}/${scheduledHabits.length} = ${percentage}`);
      console.log(`   Scheduled habits: ${scheduledHabits.length > 0 ? scheduledHabits.map(h => `${h.name} (id: ${h.id})`).join(', ') : 'NONE'}`);
      console.log(`   Completions found: ${completions.length} (habitIds: ${Array.from(completedHabitIds).join(', ')})`);
      if (scheduledHabits.length === 0 && allHabits.length > 0) {
        console.log(`⚠️ No habits scheduled for ${dayName}. All habits: ${allHabits.map(h => {
          const scheduledDays = Object.keys(h.schedule).filter(d => h.schedule[d as keyof Habit['schedule']]);
          return `${h.name} (scheduled: ${scheduledDays.join(', ') || 'NONE'})`;
        }).join('; ')}`);
      }
    }
    
    return percentage;
  } catch (error) {
    console.error('Calculate completion percentage error:', error);
    return 0;
  }
};

/**
 * Update user streak - OPTIMIZED VERSION
 * Uses batch queries instead of per-day queries for much faster performance
 */
export const updateStreak = async (userId: string) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const streakRef = doc(db, 'users', userId, 'streaks', 'main');
    const streakDoc = await getDoc(streakRef);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let lastCompletedDate = '';
    
    if (streakDoc.exists()) {
      const data = streakDoc.data() as Streak;
      currentStreak = data.currentStreak || 0;
      longestStreak = data.longestStreak || 0;
      lastCompletedDate = data.lastCompletedDate || '';
    }
    
    // Check if today is complete
    // Use a small tolerance (0.99) to account for floating point precision issues
    const todayCompletion = await calculateCompletionPercentage(userId, today);
    const isTodayComplete = todayCompletion >= 0.99; // Allow for small rounding errors
    
    console.log(`📊 Streak update - Today: ${today}, Completion: ${todayCompletion}, IsComplete: ${isTodayComplete}`);
    
    // If today is complete, we need to calculate the full streak
    if (isTodayComplete) {
      // Optimized: Only recalculate if today just became complete
      // or if we need to verify the streak
      const MAX_LOOKBACK_DAYS = 365; // 1 year - supports long streaks while keeping queries bounded
      let consecutiveDays = 0;
      
      // Check backwards from today until we find a gap
      for (let offset = 0; offset < MAX_LOOKBACK_DAYS; offset++) {
        const date = moment().subtract(offset, 'days').format('YYYY-MM-DD');
        const completion = await calculateCompletionPercentage(userId, date);
        
        // Use same tolerance for consistency
        if (completion >= 0.99) {
          consecutiveDays++;
        } else {
          // Found a gap - streak calculation complete
          break;
        }
      }
      
      console.log(`🔥 Streak calculated: ${consecutiveDays} days`);
      
      const newLongestStreak = Math.max(longestStreak, consecutiveDays);
      
      await setDoc(
        streakRef,
        {
          userId,
          currentStreak: consecutiveDays,
          longestStreak: newLongestStreak,
          lastCompletedDate: today,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      
      console.log(`✅ Streak updated: ${consecutiveDays} days (longest: ${newLongestStreak})`);
    } else {
      // Today is NOT complete yet - DON'T reset the streak to 0
      // Just keep the existing streak value (user is still working on today's habits)
      // Only update if we don't have a streak doc yet
      if (!streakDoc.exists()) {
        await setDoc(
          streakRef,
          {
            userId,
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedDate: '',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      // If streak doc exists, do nothing - keep existing streak visible
      // The streak will only update when today becomes 100% complete
    }
  } catch (error) {
    console.error('Update streak error:', error);
    throw new Error('Failed to update streak');
  }
};

/**
 * Get user streak
 */
export const getStreak = async (userId: string): Promise<Streak | null> => {
  try {
    const streakDoc = await getDoc(doc(db, 'users', userId, 'streaks', 'main'));
    if (streakDoc.exists()) {
      return { id: streakDoc.id, ...streakDoc.data() } as Streak;
    }
    return null;
  } catch (error) {
    console.error('Get streak error:', error);
    return null;
  }
};

