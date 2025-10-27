import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHabits, getCompletions } from '../firebase/habits';
import moment from 'moment';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // Disable badge to prevent red notification dot
  }),
});

const NOTIFICATION_ENABLED_KEY = 'habit_notifications_enabled';
const NOTIFICATION_TIME_KEY = 'habit_notification_time';
const NOTIFICATION_ID_KEY = 'habit_notification_id';

// Random motivational messages
const REMINDER_MESSAGES = [
  "Don't break the streak! Complete today's habits 🔥",
  "Your habits are waiting! Stay on track 💪",
  "Quick check-in: Have you completed today's habits?",
  "Keep the momentum going! Check off your habits ✅",
  "Small steps, big results. Complete your habits today! 🎯",
  "Your future self will thank you! Do your habits now 🌟",
  "Consistency is key! Time to complete your habits 📈",
  "You're building something great! Don't skip today 🏆",
];

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // For Android, create a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#667eea',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Check if habits are complete for today
 */
const checkHabitsComplete = async (userId: string): Promise<boolean> => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const [habits, completions] = await Promise.all([
      getHabits(userId),
      getCompletions(userId, today, today),
    ]);

    if (habits.length === 0) {
      return true; // No habits = nothing to complete
    }

    const completedHabitIds = new Set(completions.map(c => c.habitId));
    const allComplete = habits.every(habit => completedHabitIds.has(habit.id!));

    return allComplete;
  } catch (error) {
    console.error('Error checking habit completion:', error);
    return false;
  }
};

/**
 * Get a random reminder message
 */
const getRandomMessage = (): string => {
  return REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
};

/**
 * Schedule daily habit reminder
 * @param hour - Hour in 24-hour format (0-23)
 * @param minute - Minute (0-59)
 * 
 * Note: The notification will be scheduled, but we'll check if habits are complete
 * when the notification triggers. If habits are complete, we won't show it.
 * This is handled by the notification handler in the background task.
 */
export const scheduleDailyReminder = async (
  userId: string,
  hour: number = 20, // Default 8 PM
  minute: number = 0
): Promise<void> => {
  try {
    // Cancel existing notification
    await cancelDailyReminder();

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    // Schedule daily notification
    const trigger: Notifications.NotificationTriggerInput = {
      hour,
      minute,
      repeats: true,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'LifeSet Reminder',
        body: getRandomMessage(),
        sound: 'default',
        data: { 
          type: 'habit_reminder',
          userId, // Pass userId for background check
        },
      },
      trigger,
    });

    // Save notification ID and settings
    await AsyncStorage.multiSet([
      [NOTIFICATION_ID_KEY, notificationId],
      [NOTIFICATION_ENABLED_KEY, 'true'],
      [NOTIFICATION_TIME_KEY, JSON.stringify({ hour, minute })],
    ]);

    console.log(`✅ Daily reminder scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    throw error;
  }
};

/**
 * Cancel daily habit reminder
 */
export const cancelDailyReminder = async (): Promise<void> => {
  try {
    const notificationId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
      console.log('✅ Daily reminder cancelled');
    }

    await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'false');
  } catch (error) {
    console.error('Error cancelling daily reminder:', error);
    throw error;
  }
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
};

/**
 * Get current notification time
 */
export const getNotificationTime = async (): Promise<{ hour: number; minute: number }> => {
  try {
    const timeStr = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
    if (timeStr) {
      return JSON.parse(timeStr);
    }
    return { hour: 20, minute: 0 }; // Default 8 PM
  } catch (error) {
    console.error('Error getting notification time:', error);
    return { hour: 20, minute: 0 };
  }
};

/**
 * Send immediate test notification
 */
export const sendTestNotification = async (): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'LifeSet Test Reminder',
        body: 'This is how your daily reminder will look! 🎉',
        sound: 'default',
        data: { type: 'test' },
      },
      trigger: null, // Send immediately
    });

    console.log('✅ Test notification sent');
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};

/**
 * Clear all notifications and reset badge count
 * Call this on app launch to remove stale notifications from previous app versions
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    // Cancel all scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Dismiss all delivered notifications from notification center
    await Notifications.dismissAllNotificationsAsync();
    
    // Reset badge count
    await Notifications.setBadgeCountAsync(0);
    
    console.log('✅ All notifications cleared and badge reset');
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

/**
 * Get saved notification settings from AsyncStorage
 */
export const getNotificationSettings = async (): Promise<{
  enabled: boolean;
  time: { hour: number; minute: number };
}> => {
  try {
    const enabled = await areNotificationsEnabled();
    const time = await getNotificationTime();
    return { enabled, time };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return { enabled: false, time: { hour: 20, minute: 0 } };
  }
};

