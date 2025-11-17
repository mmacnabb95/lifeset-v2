import { 
  collection, 
  doc, 
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface ExerciseRecord {
  id?: string;
  userId: string;
  exerciseId: number;
  exerciseName: string;
  exerciseCategory?: string; // 'cardio', 'strength', etc.
  notes?: string;
  // For strength exercises
  maxWeight?: number;
  lastWeight?: number;
  lastReps?: number;
  // For cardio exercises
  maxDurationSeconds?: number;
  lastDurationSeconds?: number;
  lastUpdated: any;
}

/**
 * Get user's record for a specific exercise
 */
export const getExerciseRecord = async (
  userId: string,
  exerciseId: number
): Promise<ExerciseRecord | null> => {
  try {
    const recordRef = doc(db, 'users', userId, 'exercise_records', exerciseId.toString());
    const recordDoc = await getDoc(recordRef);
    
    if (recordDoc.exists()) {
      return { id: recordDoc.id, ...recordDoc.data() } as ExerciseRecord;
    }
    
    return null;
  } catch (error) {
    console.error('Get exercise record error:', error);
    return null;
  }
};

/**
 * Get all exercise records for a user
 */
export const getAllExerciseRecords = async (userId: string): Promise<ExerciseRecord[]> => {
  try {
    const recordsRef = collection(db, 'users', userId, 'exercise_records');
    const snapshot = await getDocs(recordsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ExerciseRecord));
  } catch (error) {
    console.error('Get all exercise records error:', error);
    return [];
  }
};

/**
 * Update or create an exercise record
 * For strength exercises: provide weight and reps
 * For cardio exercises: provide durationSeconds
 */
export const updateExerciseRecord = async (
  userId: string,
  exerciseId: number,
  exerciseName: string,
  exerciseCategory: string,
  data: { weight?: number; reps?: number; durationSeconds?: number }
): Promise<void> => {
  try {
    const recordRef = doc(db, 'users', userId, 'exercise_records', exerciseId.toString());
    const existingRecord = await getDoc(recordRef);
    
    const recordData: any = {
      userId,
      exerciseId,
      exerciseName,
      exerciseCategory,
      lastUpdated: serverTimestamp(),
    };
    
    // Handle strength exercises (weight-based)
    if (data.weight !== undefined) {
      recordData.maxWeight = existingRecord.exists() 
        ? Math.max(existingRecord.data().maxWeight || 0, data.weight)
        : data.weight;
      recordData.lastWeight = data.weight;
      
      if (data.reps !== undefined) {
        recordData.lastReps = data.reps;
      }
    }
    
    // Handle cardio exercises (duration-based)
    if (data.durationSeconds !== undefined) {
      recordData.maxDurationSeconds = existingRecord.exists() 
        ? Math.max(existingRecord.data().maxDurationSeconds || 0, data.durationSeconds)
        : data.durationSeconds;
      recordData.lastDurationSeconds = data.durationSeconds;
    }
    
    await setDoc(recordRef, recordData, { merge: true });
    console.log(`Updated record for ${exerciseName}:`, data);
  } catch (error) {
    console.error('Update exercise record error:', error);
    throw new Error('Failed to update exercise record');
  }
};

/**
 * Save personal notes for an exercise without affecting stats
 */
export const saveExerciseNotes = async (
  userId: string,
  exerciseId: number,
  exerciseName: string,
  exerciseCategory: string,
  notes: string
): Promise<void> => {
  try {
    const recordRef = doc(db, 'users', userId, 'exercise_records', exerciseId.toString());
    
    await setDoc(
      recordRef,
      {
        userId,
        exerciseId,
        exerciseName,
        exerciseCategory,
        notes,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
    
    console.log(`Saved notes for ${exerciseName}`);
  } catch (error) {
    console.error('Save exercise notes error:', error);
    throw new Error('Failed to save notes');
  }
};


