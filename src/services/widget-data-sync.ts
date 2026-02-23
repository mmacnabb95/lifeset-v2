// Widget Data Sync Service
// Syncs habits, goals, and streak data to App Groups for iOS widgets
// Uses ExtensionStorage from @bacons/apple-targets (much simpler than custom native module!)

import { Platform } from 'react-native';
import { ExtensionStorage } from '@bacons/apple-targets';
import { getHabits, getCompletions, getStreak, Habit, Streak } from './firebase/habits';
import { getGoals, Goal } from './firebase/goals';
import moment from 'moment';

const APP_GROUP_ID = 'group.com.lifesetwellbeing.lifeset';

// Initialize ExtensionStorage for App Groups
const storage = new ExtensionStorage(APP_GROUP_ID);

export interface WidgetData {
  userId: string;
  streak: number;
  longestStreak: number;
  todayCompletions: number;
  todayTotal: number;
  todayHabits: Array<{
    id: string;
    name: string;
    completed: boolean;
  }>;
  activeGoals: Array<{
    id: string;
    title: string;
    progress: number;
    target: number;
    percentage: number;
  }>;
  lastUpdated: string; // ISO timestamp
}

/**
 * Sync widget data to UserDefaults (App Groups)
 * This makes the data available to the iOS widget extension
 */
export const syncWidgetData = async (userId: string): Promise<void> => {
  try {
    if (Platform.OS !== 'ios') {
      return; // Widgets only work on iOS
    }

    const today = moment().format('YYYY-MM-DD');
    const dayName = moment().format('dddd').toLowerCase() as keyof Habit['schedule'];

    // Fetch all data in parallel
    const [habits, completions, streak, goals] = await Promise.all([
      getHabits(userId),
      getCompletions(userId, today, today),
      getStreak(userId),
      getGoals(userId),
    ]);

    // Show ALL habits in widget (not just scheduled ones) - users want to see all their habits
    // Only filter by creation date to exclude future habits
    const allHabits = habits.filter(h => {
      // Check if habit was created on or before today
      if (!h.createdAt) return true; // Include habits without creation date
      const habitCreatedDate = moment(h.createdAt.toDate()).format('YYYY-MM-DD');
      const isCreatedBeforeToday = habitCreatedDate <= today;
      
      if (__DEV__ && !isCreatedBeforeToday) {
        console.log(`⚠️ Habit "${h.name}" created on ${habitCreatedDate}, but today is ${today} - excluding from widget`);
      }
      
      return isCreatedBeforeToday;
    });
    
    // Separate habits into "scheduled for today" and "not scheduled for today"
    const scheduledForToday = allHabits.filter(h => h.schedule[dayName]);
    const notScheduledForToday = allHabits.filter(h => !h.schedule[dayName]);
    
    // Show scheduled habits first, then unscheduled ones (so users see what they should do today first)
    const orderedHabits = [...scheduledForToday, ...notScheduledForToday];
    
    if (__DEV__) {
      console.log(`📱 Widget sync - Found ${allHabits.length} total habits (${scheduledForToday.length} scheduled for ${dayName}, ${notScheduledForToday.length} not scheduled)`);
    }
    
    // Get completed habit IDs for today
    const completedHabitIds = new Set(completions.map(c => c.habitId));

    // Build today's habits list - include ALL habits, ordered with scheduled first
    const todayHabitsList = orderedHabits.map(habit => ({
      id: habit.id!,
      name: habit.name,
      completed: completedHabitIds.has(habit.id!),
    }));

    // Get active (incomplete) goals
    const activeGoalsList = goals
      .filter(goal => !goal.completed && goal.targetCompletions)
      .map(goal => ({
        id: goal.id!,
        title: goal.title,
        progress: goal.currentProgress || 0,
        target: goal.targetCompletions || 0,
        percentage: goal.targetCompletions 
          ? Math.min(100, Math.round((goal.currentProgress || 0) / goal.targetCompletions * 100))
          : 0,
      }))
      .slice(0, 3); // Limit to 3 goals for widget

    // Build widget data
    // Count only scheduled habits for completion percentage (X/Y habits today)
    const completedScheduledCount = scheduledForToday.filter(h => completedHabitIds.has(h.id!)).length;
    
    const widgetData: WidgetData = {
      userId,
      streak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      todayCompletions: completedScheduledCount, // Only count scheduled habits
      todayTotal: scheduledForToday.length, // Only count scheduled habits
      todayHabits: todayHabitsList, // Include ALL habits in the list (scheduled first, then unscheduled)
      activeGoals: activeGoalsList,
      lastUpdated: new Date().toISOString(),
    };
    
    if (__DEV__) {
      console.log(`📱 Widget data built: ${todayHabitsList.length} total habits sent to widget`);
      console.log(`📱 Completion: ${completedScheduledCount}/${scheduledForToday.length} scheduled habits completed`);
      console.log(`📱 Habit names: ${todayHabitsList.map((h, i) => {
        const habit = orderedHabits[i];
        return `${h.name}${habit.schedule[dayName] ? '' : ' (not scheduled today)'}`;
      }).join(', ')}`);
    }

    // Store in App Groups using ExtensionStorage (much simpler!)
    try {
      storage.set('widgetData', JSON.stringify(widgetData));
      
      // Trigger widget refresh
      ExtensionStorage.reloadWidget();
    } catch (error) {
      console.error('❌ Error writing to ExtensionStorage:', error);
      // Don't throw - widget data sync is non-critical
    }

    console.log('✅ Widget data synced:', {
      streak: widgetData.streak,
      completions: `${widgetData.todayCompletions}/${widgetData.todayTotal}`,
      goals: widgetData.activeGoals.length,
    });
  } catch (error) {
    console.error('❌ Error syncing widget data:', error);
    // Don't throw - widget data sync is non-critical
  }
};

/**
 * Sync widget data after habit completion
 */
export const syncAfterHabitCompletion = async (userId: string): Promise<void> => {
  // Add small delay to ensure Firebase write has propagated
  setTimeout(() => {
    syncWidgetData(userId);
  }, 500);
};

/**
 * Sync widget data after goal update
 */
export const syncAfterGoalUpdate = async (userId: string): Promise<void> => {
  setTimeout(() => {
    syncWidgetData(userId);
  }, 300);
};

