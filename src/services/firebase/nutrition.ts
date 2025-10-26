// Firebase Nutrition Service
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface MealLog {
  id?: string;
  userId: string;
  recipeId?: string; // Reference to recipes.json
  mealName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // YYYY-MM-DD format
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt?: Timestamp;
}

export interface WaterLog {
  userId: string;
  date: string; // YYYY-MM-DD format
  glasses: number; // Number of glasses (8oz each)
  goal: number; // Target glasses per day
  updatedAt?: Timestamp;
}

export interface NutritionGoals {
  userId: string;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  waterGoal: number; // glasses per day
  updatedAt?: Timestamp;
}

/**
 * Log a meal
 */
export const logMeal = async (meal: Omit<MealLog, 'id' | 'createdAt'>) => {
  try {
    const mealsRef = collection(db, 'users', meal.userId, 'meals');
    const docRef = await addDoc(mealsRef, {
      ...meal,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Log meal error:', error);
    throw new Error('Failed to log meal');
  }
};

/**
 * Get meals for a specific date
 */
export const getMealsForDate = async (userId: string, date: string): Promise<MealLog[]> => {
  try {
    const mealsRef = collection(db, 'users', userId, 'meals');
    const q = query(mealsRef, where('date', '==', date));
    const snapshot = await getDocs(q);
    const meals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealLog));
    
    // Sort in memory instead of using orderBy (to avoid index requirement)
    return meals.sort((a, b) => {
      const timeA = a.createdAt ? (a.createdAt as any).seconds : 0;
      const timeB = b.createdAt ? (b.createdAt as any).seconds : 0;
      return timeA - timeB;
    });
  } catch (error) {
    console.error('Get meals error:', error);
    throw new Error('Failed to get meals');
  }
};

/**
 * Get today's nutrition totals
 */
export const getTodayNutrition = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const meals = await getMealsForDate(userId, today);
    
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return {
      ...totals,
      mealCount: meals.length,
      meals,
    };
  } catch (error) {
    console.error('Get today nutrition error:', error);
    throw new Error('Failed to get today nutrition');
  }
};

/**
 * Log water intake for today
 */
export const logWater = async (userId: string, glasses: number) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const waterRef = doc(db, 'users', userId, 'water', today);
    
    await setDoc(waterRef, {
      userId,
      date: today,
      glasses,
      goal: 8, // Default 8 glasses
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Log water error:', error);
    throw new Error('Failed to log water');
  }
};

/**
 * Get water intake for today
 */
export const getTodayWater = async (userId: string): Promise<WaterLog | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const waterDoc = await getDoc(doc(db, 'users', userId, 'water', today));
    
    if (waterDoc.exists()) {
      return waterDoc.data() as WaterLog;
    }
    
    return {
      userId,
      date: today,
      glasses: 0,
      goal: 8,
    };
  } catch (error) {
    console.error('Get water error:', error);
    return {
      userId,
      date: new Date().toISOString().split('T')[0],
      glasses: 0,
      goal: 8,
    };
  }
};

/**
 * Get or create nutrition goals
 */
export const getNutritionGoals = async (userId: string): Promise<NutritionGoals> => {
  try {
    const goalsDoc = await getDoc(doc(db, 'users', userId, 'nutrition', 'goals'));
    
    if (goalsDoc.exists()) {
      return goalsDoc.data() as NutritionGoals;
    }
    
    // Default goals
    return {
      userId,
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      waterGoal: 8,
    };
  } catch (error) {
    console.error('Get nutrition goals error:', error);
    return {
      userId,
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      waterGoal: 8,
    };
  }
};

/**
 * Update nutrition goals
 */
export const updateNutritionGoals = async (userId: string, goals: Partial<NutritionGoals>) => {
  try {
    const goalsRef = doc(db, 'users', userId, 'nutrition', 'goals');
    await setDoc(goalsRef, {
      userId,
      ...goals,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Update nutrition goals error:', error);
    throw new Error('Failed to update nutrition goals');
  }
};

