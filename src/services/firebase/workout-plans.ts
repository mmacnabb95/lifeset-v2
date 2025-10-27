import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import workoutPlansData from '../../data/workout-plans.json';

export interface WorkoutPlanExercise {
  exerciseId: number;
  sets: number;
  reps: number;
  restSeconds: number;
  order: number;
  note?: string;
  weight?: number; // User can add weight when executing
}

export interface WorkoutPlan {
  id?: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationWeeks: number;
  daysPerWeek: number;
  category: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'custom';
  isTemplate: boolean; // True for pre-made plans
  createdBy: string; // User ID or "LifeSet" for templates
  userId?: string; // Only for user-created plans
  imageUrl?: string | null;
  exercises: WorkoutPlanExercise[];
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutPlanProgress {
  id?: string;
  userId: string;
  workoutPlanId: string;
  startedAt: Date;
  lastWorkoutDate?: Date;
  completedWorkouts: number;
  totalWorkoutsPlanned: number; // daysPerWeek * durationWeeks
  isActive: boolean;
  completedAt?: Date;
  notes?: string;
}

/**
 * Create a new custom workout plan
 */
export const createWorkoutPlan = async (
  userId: string,
  plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const planRef = doc(collection(db, 'workoutPlans'));
    const planData = {
      ...plan,
      userId,
      createdBy: userId,
      isTemplate: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(planRef, planData);
    console.log('Workout plan created:', planRef.id);
    return planRef.id;
  } catch (error) {
    console.error('Error creating workout plan:', error);
    throw error;
  }
};

/**
 * Get all workout plans (templates + user's custom plans)
 */
export const getWorkoutPlans = async (
  userId?: string
): Promise<WorkoutPlan[]> => {
  try {
    const plansRef = collection(db, 'workoutPlans');
    let q;

    if (userId) {
      // Get templates + user's custom plans
      q = query(
        plansRef,
        where('isTemplate', '==', true)
      );
      const templatesSnapshot = await getDocs(q);
      
      const userPlansQuery = query(
        plansRef,
        where('userId', '==', userId)
      );
      const userPlansSnapshot = await getDocs(userPlansQuery);

      const allPlans = [
        ...templatesSnapshot.docs,
        ...userPlansSnapshot.docs,
      ];

      return allPlans.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as WorkoutPlan[];
    } else {
      // Get only templates (for logged-out users)
      q = query(plansRef, where('isTemplate', '==', true));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as WorkoutPlan[];
    }
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    throw error;
  }
};

/**
 * Get a specific workout plan by ID
 */
export const getWorkoutPlan = async (planId: string): Promise<WorkoutPlan | null> => {
  try {
    const planRef = doc(db, 'workoutPlans', planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) {
      return null;
    }

    return {
      id: planDoc.id,
      ...planDoc.data(),
      createdAt: planDoc.data().createdAt?.toDate(),
      updatedAt: planDoc.data().updatedAt?.toDate(),
    } as WorkoutPlan;
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    throw error;
  }
};

/**
 * Update a workout plan
 */
export const updateWorkoutPlan = async (
  planId: string,
  updates: Partial<WorkoutPlan>
): Promise<void> => {
  try {
    const planRef = doc(db, 'workoutPlans', planId);
    await updateDoc(planRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    console.log('Workout plan updated:', planId);
  } catch (error) {
    console.error('Error updating workout plan:', error);
    throw error;
  }
};

/**
 * Delete a workout plan
 */
export const deleteWorkoutPlan = async (planId: string): Promise<void> => {
  try {
    const planRef = doc(db, 'workoutPlans', planId);
    await deleteDoc(planRef);
    console.log('Workout plan deleted:', planId);
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    throw error;
  }
};

/**
 * Start a workout plan (track progress)
 * Accepts either a planId (string) for Firestore plans, or a full plan object for template plans
 */
export const startWorkoutPlan = async (
  userId: string,
  workoutPlanIdOrPlan: string | WorkoutPlan
): Promise<string> => {
  try {
    let plan: WorkoutPlan | null = null;
    let workoutPlanId: string;

    // Check if we received a plan object (template) or just an ID (Firestore)
    if (typeof workoutPlanIdOrPlan === 'string') {
      // It's a Firestore plan ID - fetch it
      workoutPlanId = workoutPlanIdOrPlan;
      plan = await getWorkoutPlan(workoutPlanId);
    } else {
      // It's a template plan object
      plan = workoutPlanIdOrPlan;
      workoutPlanId = plan.id!;
    }

    if (!plan) {
      throw new Error('Workout plan not found');
    }

    const progressRef = doc(collection(db, 'workoutPlanProgress'));
    const progressData: Omit<WorkoutPlanProgress, 'id'> = {
      userId,
      workoutPlanId,
      startedAt: new Date(),
      completedWorkouts: 0,
      totalWorkoutsPlanned: plan.daysPerWeek * plan.durationWeeks,
      isActive: true,
    };

    await setDoc(progressRef, {
      ...progressData,
      startedAt: Timestamp.now(),
    });

    console.log('Workout plan started:', progressRef.id);
    return progressRef.id;
  } catch (error) {
    console.error('Error starting workout plan:', error);
    throw error;
  }
};

/**
 * Get active workout plans for a user
 */
export const getActiveWorkoutPlans = async (
  userId: string
): Promise<(WorkoutPlanProgress & { plan: WorkoutPlan })[]> => {
  try {
    const progressRef = collection(db, 'workoutPlanProgress');
    const q = query(
      progressRef,
      where('userId', '==', userId),
      where('isActive', '==', true)
      // Removed orderBy to avoid needing composite index - we'll sort in memory
    );

    const snapshot = await getDocs(q);
    const progressList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startedAt: doc.data().startedAt?.toDate(),
      lastWorkoutDate: doc.data().lastWorkoutDate?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as WorkoutPlanProgress[];

    // Sort by startedAt in memory (most recent first)
    progressList.sort((a, b) => {
      if (!a.startedAt || !b.startedAt) return 0;
      return b.startedAt.getTime() - a.startedAt.getTime();
    });

    // Fetch the actual plans (check templates first, then Firestore)
    const templatePlans = workoutPlansData as WorkoutPlan[];
    const results = await Promise.all(
      progressList.map(async (progress) => {
        try {
          // First, check if it's a template plan
          const templatePlan = templatePlans.find(p => p.id === progress.workoutPlanId);
          if (templatePlan) {
            return {
              ...progress,
              plan: templatePlan,
            };
          }
          
          // If not a template, fetch from Firestore
          const plan = await getWorkoutPlan(progress.workoutPlanId);
          if (plan) {
            return {
              ...progress,
              plan,
            };
          }
          return null;
        } catch (error) {
          console.error('Error fetching plan for progress:', progress.workoutPlanId, error);
          return null;
        }
      })
    );

    // Filter out any null results (plans that couldn't be fetched or don't exist)
    return results.filter((r): r is (WorkoutPlanProgress & { plan: WorkoutPlan }) => r !== null);
  } catch (error) {
    console.error('Error fetching active workout plans:', error);
    throw error;
  }
};

/**
 * Complete a workout session
 */
export const completeWorkoutSession = async (
  progressId: string
): Promise<void> => {
  try {
    const progressRef = doc(db, 'workoutPlanProgress', progressId);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      throw new Error('Progress not found');
    }

    const data = progressDoc.data() as WorkoutPlanProgress;
    const newCompletedCount = data.completedWorkouts + 1;
    const isCompleted = newCompletedCount >= data.totalWorkoutsPlanned;

    await updateDoc(progressRef, {
      completedWorkouts: newCompletedCount,
      lastWorkoutDate: Timestamp.now(),
      isActive: !isCompleted,
      ...(isCompleted && { completedAt: Timestamp.now() }),
    });

    console.log('Workout session completed:', progressId);
  } catch (error) {
    console.error('Error completing workout session:', error);
    throw error;
  }
};

/**
 * Duplicate a template plan for customization
 */
export const duplicateWorkoutPlan = async (
  userId: string,
  sourcePlanId: string,
  sourcePlan?: WorkoutPlan, // Accept the plan object directly for local templates
  newName?: string
): Promise<string> => {
  try {
    let planToDuplicate = sourcePlan;
    
    // If plan not provided, try to fetch from Firestore
    if (!planToDuplicate) {
      planToDuplicate = await getWorkoutPlan(sourcePlanId);
    }
    
    if (!planToDuplicate) {
      throw new Error('Source plan not found');
    }

    const newPlan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'> = {
      ...planToDuplicate,
      name: newName || `${planToDuplicate.name} (Copy)`,
      userId,
      createdBy: userId,
      isTemplate: false,
    };

    return await createWorkoutPlan(userId, newPlan);
  } catch (error) {
    console.error('Error duplicating workout plan:', error);
    throw error;
  }
};

