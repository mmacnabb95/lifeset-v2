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
  maxWeight: number;
  lastWeight?: number;
  lastReps?: number;
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
 */
export const updateExerciseRecord = async (
  userId: string,
  exerciseId: number,
  exerciseName: string,
  weight: number,
  reps?: number
): Promise<void> => {
  try {
    const recordRef = doc(db, 'users', userId, 'exercise_records', exerciseId.toString());
    const existingRecord = await getDoc(recordRef);
    
    const recordData: any = {
      userId,
      exerciseId,
      exerciseName,
      maxWeight: existingRecord.exists() 
        ? Math.max(existingRecord.data().maxWeight || 0, weight)
        : weight,
      lastWeight: weight,
      lastUpdated: serverTimestamp(),
    };
    
    // Only add lastReps if provided (avoid undefined)
    if (reps !== undefined) {
      recordData.lastReps = reps;
    }
    
    await setDoc(recordRef, recordData);
    console.log(`Updated record for ${exerciseName}: ${weight}kg`);
  } catch (error) {
    console.error('Update exercise record error:', error);
    throw new Error('Failed to update exercise record');
  }
};

/**
 * Bulk update exercise records (after completing a workout)
 */
export const updateMultipleExerciseRecords = async (
  userId: string,
  exercises: { exerciseId: number; exerciseName: string; weight: number; reps?: number }[]
): Promise<void> => {
  try {
    const updates = exercises.map(ex => 
      updateExerciseRecord(userId, ex.exerciseId, ex.exerciseName, ex.weight, ex.reps)
    );
    await Promise.all(updates);
  } catch (error) {
    console.error('Bulk update exercise records error:', error);
    throw new Error('Failed to update exercise records');
  }
};

