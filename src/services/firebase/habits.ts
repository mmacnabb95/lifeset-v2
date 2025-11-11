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
    
    // Update streak
    await updateStreak(userId);
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
    return completedCount / scheduledHabits.length;
  } catch (error) {
    console.error('Calculate completion percentage error:', error);
    return 0;
  }
};

/**
 * Update user streak
 * This is the core streak logic copied from your existing implementation
 */
export const updateStreak = async (userId: string) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD');
    const threeDaysAgo = moment().subtract(3, 'days').format('YYYY-MM-DD');
    
    // Get completion percentages for last several days
    const [completionToday, completionYesterday, completion2Days, completion3Days] = await Promise.all([
      calculateCompletionPercentage(userId, today),
      calculateCompletionPercentage(userId, yesterday),
      calculateCompletionPercentage(userId, twoDaysAgo),
      calculateCompletionPercentage(userId, threeDaysAgo),
    ]);
    
    console.log('Streak calculation:', {
      today,
      yesterday,
      twoDaysAgo,
      threeDaysAgo,
      completionToday,
      completionYesterday,
      completion2Days,
      completion3Days,
    });
    
    // Get current streak
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
    
    // Case 1: No streak exists & today is complete
    if (!streakDoc.exists() && completionToday === 1) {
      await setDoc(streakRef, {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: today,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    
    // Case 2: User missed yesterday, but completed today → reset to 1
    // BUT: Check if they completed yesterday retroactively (filling in past days)
    if (completionYesterday < 1 && completionToday === 1 && lastCompletedDate !== today) {
      // Check if there's a consecutive streak going back from today
      let consecutiveDays = 1; // Today is complete
      
      // Check if yesterday is NOW complete (maybe they just filled it in)
      if (completionYesterday === 1) {
        consecutiveDays++;
        // Check 2 days ago
        if (completion2Days === 1) {
          consecutiveDays++;
          // Check 3 days ago
          if (completion3Days === 1) {
            consecutiveDays++;
          }
        }
      }
      
      const newCurrentStreak = consecutiveDays;
      const newLongestStreak = Math.max(longestStreak, newCurrentStreak);
      
      console.log('📊 Recalculated streak from today backwards:', {
        consecutiveDays,
        completionToday,
        completionYesterday,
        completion2Days,
        completion3Days,
      });
      
      await updateDoc(streakRef, {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: today,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    
    // Case 3: Yesterday complete, today complete, and not already counted → increment
    if (
      completionYesterday === 1 &&
      completionToday === 1 &&
      lastCompletedDate !== today
    ) {
      const newCurrentStreak = currentStreak + 1;
      const newLongestStreak = Math.max(longestStreak, newCurrentStreak);
      await updateDoc(streakRef, {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: today,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    
    // Case 3b: Already counted today, but now both yesterday AND today are 100% → increment if needed
    if (
      completionYesterday === 1 &&
      completionToday === 1 &&
      lastCompletedDate === today &&
      currentStreak === 1 // Was reset to 1, but should be higher
    ) {
      const newCurrentStreak = 2; // Yesterday + today
      const newLongestStreak = Math.max(longestStreak, newCurrentStreak);
      await updateDoc(streakRef, {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: today,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    
    // Case 4: Already incremented today but dropped below 100% → decrement
    if (lastCompletedDate === today && completionToday < 1) {
      const newCurrentStreak = Math.max(0, currentStreak - 1);
      await updateDoc(streakRef, {
        currentStreak: newCurrentStreak,
        lastCompletedDate: yesterday,
        updatedAt: serverTimestamp(),
      });
      return;
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

