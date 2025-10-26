// Firebase Workouts Service
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface WorkoutLog {
  id?: string;
  userId: string;
  workoutType: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  title: string;
  duration: number; // minutes
  caloriesBurned?: number;
  notes?: string;
  exercises?: WorkoutExercise[];
  date: string; // YYYY-MM-DD format
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number; // kg or lbs
  duration?: number; // minutes for cardio
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  thisWeek: number;
  thisMonth: number;
}

/**
 * Log a workout
 */
export const logWorkout = async (workout: Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const workoutsRef = collection(db, 'users', workout.userId, 'workouts');
    const docRef = await addDoc(workoutsRef, {
      ...workout,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Log workout error:', error);
    throw new Error('Failed to log workout');
  }
};

/**
 * Get workouts for a specific date
 */
export const getWorkoutsForDate = async (userId: string, date: string): Promise<WorkoutLog[]> => {
  try {
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    const q = query(workoutsRef, where('date', '==', date));
    const snapshot = await getDocs(q);
    const workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutLog));
    
    // Sort by createdAt in memory
    return workouts.sort((a, b) => {
      const timeA = a.createdAt ? (a.createdAt as any).seconds : 0;
      const timeB = b.createdAt ? (b.createdAt as any).seconds : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    throw new Error('Failed to get workouts');
  }
};

/**
 * Get recent workouts
 */
export const getRecentWorkouts = async (userId: string, limitCount: number = 5): Promise<WorkoutLog[]> => {
  try {
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    const snapshot = await getDocs(workoutsRef);
    const workouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutLog));
    
    // Sort by date in memory
    const sorted = workouts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return sorted.slice(0, limitCount);
  } catch (error) {
    console.error('Get recent workouts error:', error);
    throw new Error('Failed to get recent workouts');
  }
};

/**
 * Get today's workouts
 */
export const getTodayWorkouts = async (userId: string): Promise<WorkoutLog[]> => {
  const today = new Date().toISOString().split('T')[0];
  return getWorkoutsForDate(userId, today);
};

/**
 * Get workout statistics
 */
export const getWorkoutStats = async (userId: string): Promise<WorkoutStats> => {
  try {
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    const snapshot = await getDocs(workoutsRef);
    const workouts = snapshot.docs.map(doc => doc.data() as WorkoutLog);
    
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);
    
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const monthAgoStr = monthAgo.toISOString().split('T')[0];
    
    const stats = {
      totalWorkouts: workouts.length,
      totalMinutes: workouts.reduce((sum, w) => sum + w.duration, 0),
      totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      thisWeek: workouts.filter(w => w.date >= weekAgoStr).length,
      thisMonth: workouts.filter(w => w.date >= monthAgoStr).length,
    };
    
    return stats;
  } catch (error) {
    console.error('Get workout stats error:', error);
    return {
      totalWorkouts: 0,
      totalMinutes: 0,
      totalCalories: 0,
      thisWeek: 0,
      thisMonth: 0,
    };
  }
};

/**
 * Update a workout
 */
export const updateWorkout = async (userId: string, workoutId: string, updates: Partial<WorkoutLog>) => {
  try {
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
    await updateDoc(workoutRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update workout error:', error);
    throw new Error('Failed to update workout');
  }
};

/**
 * Delete a workout
 */
export const deleteWorkout = async (userId: string, workoutId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'workouts', workoutId));
  } catch (error) {
    console.error('Delete workout error:', error);
    throw new Error('Failed to delete workout');
  }
};

