// Firebase Goals Service
// Goals that habits can contribute to

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
import { addXP } from './user';
import { getCompletions } from './habits';

export interface Goal {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  targetDate?: Timestamp; // Optional target date
  targetCompletions?: number; // Optional: target number of habit completions
  linkedHabitIds: string[]; // Habits that contribute to this goal
  currentProgress: number; // Current progress count
  completed: boolean;
  completedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Get organisation goals (suggested goals for members)
 */
export const getOrganisationGoals = async (
  organisationId: string
): Promise<{ id: string; title: string; description?: string; targetCompletions?: number; linkedOrganisationHabitIds: string[] }[]> => {
  try {
    const q = query(
      collection(db, 'organisationGoals'),
      where('organisationId', '==', organisationId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as { id: string; title: string; description?: string; targetCompletions?: number; linkedOrganisationHabitIds: string[] }[];
  } catch (error) {
    console.error('Get organisation goals error:', error);
    return [];
  }
};

/**
 * Create a new goal
 */
export const createGoal = async (goal: Omit<Goal, 'id' | 'currentProgress' | 'completed' | 'createdAt' | 'updatedAt'>) => {
  try {
    const goalsRef = collection(db, 'users', goal.userId, 'goals');
    const docRef = await addDoc(goalsRef, {
      ...goal,
      currentProgress: 0,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Create goal error:', error);
    throw new Error('Failed to create goal');
  }
};

/**
 * Get all goals for a user
 */
export const getGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const q = query(goalsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt,
      targetDate: doc.data().targetDate,
      completedAt: doc.data().completedAt,
    })) as Goal[];
  } catch (error) {
    console.error('Get goals error:', error);
    throw new Error('Failed to get goals');
  }
};

/**
 * Get a single goal by ID
 */
export const getGoal = async (userId: string, goalId: string): Promise<Goal | null> => {
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    const goalDoc = await getDoc(goalRef);
    
    if (!goalDoc.exists()) {
      return null;
    }
    
    return {
      id: goalDoc.id,
      ...goalDoc.data(),
      createdAt: goalDoc.data().createdAt,
      updatedAt: goalDoc.data().updatedAt,
      targetDate: goalDoc.data().targetDate,
      completedAt: goalDoc.data().completedAt,
    } as Goal;
  } catch (error) {
    console.error('Get goal error:', error);
    throw new Error('Failed to get goal');
  }
};

/**
 * Update a goal
 */
export const updateGoal = async (userId: string, goalId: string, updates: Partial<Goal>) => {
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update goal error:', error);
    throw new Error('Failed to update goal');
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (userId: string, goalId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
  } catch (error) {
    console.error('Delete goal error:', error);
    throw new Error('Failed to delete goal');
  }
};

/**
 * Link a habit to one or more goals
 * Adds the habitId to the linkedHabitIds array of the specified goals
 * Optionally recalculates goal progress after linking
 */
export const linkHabitToGoals = async (
  userId: string, 
  habitId: string, 
  goalIds: string[],
  recalculateProgress: boolean = false
) => {
  try {
    if (goalIds.length === 0) return;
    
    const updatePromises = goalIds.map(async (goalId) => {
      const goalRef = doc(db, 'users', userId, 'goals', goalId);
      const goalDoc = await getDoc(goalRef);
      
      if (goalDoc.exists()) {
        const goal = goalDoc.data() as Goal;
        const linkedHabitIds = goal.linkedHabitIds || [];
        
        // Only add if not already linked
        if (!linkedHabitIds.includes(habitId)) {
          await updateDoc(goalRef, {
            linkedHabitIds: [...linkedHabitIds, habitId],
            updatedAt: serverTimestamp(),
          });
        }
      }
    });
    
    await Promise.all(updatePromises);
    
    // Recalculate goal progress if requested (useful when linking existing habits to new goals)
    if (recalculateProgress) {
      try {
        // Add a small delay to ensure any recent completions are written to Firestore
        // This prevents race conditions where a completion happens right before linking
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get all completions for this habit (check last 365 days to catch all completions)
        const startDate = moment().subtract(365, 'days').format('YYYY-MM-DD');
        const endDate = moment().format('YYYY-MM-DD');
        const completions = await getCompletions(userId, startDate, endDate);
        const habitCompletions = completions
          .filter(c => c.habitId === habitId)
          .map(c => ({ habitId: c.habitId, date: c.date }));
        
        // Recalculate progress for each linked goal
        for (const goalId of goalIds) {
          await recalculateGoalProgress(userId, goalId, habitCompletions);
        }
      } catch (error) {
        console.error('Error recalculating goal progress after linking:', error);
        // Don't throw - linking should still succeed
      }
    }
  } catch (error) {
    console.error('Link habit to goals error:', error);
    throw new Error('Failed to link habit to goals');
  }
};

/**
 * Update goal progress based on habit completions
 * This should be called when a habit linked to a goal is completed
 * Returns an array of goal titles that were just completed
 */
export const updateGoalProgress = async (userId: string, habitId: string): Promise<string[]> => {
  try {
    // Add a small delay to ensure the completion is written to Firestore before updating goal progress
    // This prevents race conditions where goal progress is updated before the completion exists
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find all goals that include this habit
    const goalsRef = collection(db, 'users', userId, 'goals');
    const goalsQuery = query(
      goalsRef,
      where('linkedHabitIds', 'array-contains', habitId),
      where('completed', '==', false)
    );
    const snapshot = await getDocs(goalsQuery);
    
    const completedGoalTitles: string[] = [];
    
    const updatePromises = snapshot.docs.map(async (goalDoc) => {
      // Re-fetch the goal to get the latest progress (prevents race conditions)
      const goalDocLatest = await getDoc(goalDoc.ref);
      const goal = goalDocLatest.data() as Goal;
      const newProgress = (goal.currentProgress || 0) + 1;
      
      // Check if goal is completed
      const isCompleted = goal.targetCompletions 
        ? newProgress >= goal.targetCompletions
        : false;
      
      const updates: any = {
        currentProgress: newProgress,
        updatedAt: serverTimestamp(),
      };
      
      if (isCompleted && !goal.completed) {
        updates.completed = true;
        updates.completedAt = serverTimestamp();
        completedGoalTitles.push(goal.title);
        
        // Award 50 XP for completing a goal
        try {
          await addXP(userId, 50);
        } catch (error) {
          console.error('Error awarding XP for goal completion:', error);
          // Don't throw - XP is a bonus, goal completion should still succeed
        }
      }
      
      await updateDoc(goalDoc.ref, updates);
    });
    
    await Promise.all(updatePromises);
    return completedGoalTitles;
  } catch (error) {
    console.error('Update goal progress error:', error);
    // Don't throw - this is a background operation
    return [];
  }
};

/**
 * Recalculate goal progress from habit completions
 * Useful for fixing progress if it gets out of sync
 */
export const recalculateGoalProgress = async (userId: string, goalId: string, habitCompletions: { habitId: string; date: string }[]) => {
  try {
    const goal = await getGoal(userId, goalId);
    if (!goal) return;
    
    // Count completions for linked habits
    const linkedHabitCompletions = habitCompletions.filter(
      completion => goal.linkedHabitIds.includes(completion.habitId)
    );
    
    const newProgress = linkedHabitCompletions.length;
    const isCompleted = goal.targetCompletions 
      ? newProgress >= goal.targetCompletions
      : false;
    
    const updates: any = {
      currentProgress: newProgress,
      updatedAt: serverTimestamp(),
    };
    
    if (isCompleted && !goal.completed) {
      updates.completed = true;
      updates.completedAt = serverTimestamp();
    } else if (!isCompleted && goal.completed) {
      updates.completed = false;
      updates.completedAt = null;
    }
    
    await updateGoal(userId, goalId, updates);
  } catch (error) {
    console.error('Recalculate goal progress error:', error);
    throw new Error('Failed to recalculate goal progress');
  }
};

