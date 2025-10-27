import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  areNotificationsEnabled,
  getNotificationTime,
  sendTestNotification,
} from 'src/services/notifications/habitReminder';

export const NotificationSettings = () => {
  const { userId } = useFirebaseUser();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [isEnabled, notifTime] = await Promise.all([
        areNotificationsEnabled(),
        getNotificationTime(),
      ]);

      setEnabled(isEnabled);
      
      // Create Date object from hour/minute
      const now = new Date();
      now.setHours(notifTime.hour);
      now.setMinutes(notifTime.minute);
      setTime(now);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    if (!userId) {
      Alert.alert('Login Required', 'Please log in to enable notifications');
      return;
    }

    try {
      setEnabled(value);

      if (value) {
        // Enable notifications
        const hour = time.getHours();
        const minute = time.getMinutes();
        await scheduleDailyReminder(userId, hour, minute);
        Alert.alert(
          'Notifications Enabled',
          `You'll receive daily reminders at ${formatTime(hour, minute)} to complete your habits!`
        );
      } else {
        // Disable notifications
        await cancelDailyReminder();
        Alert.alert('Notifications Disabled', 'You will no longer receive habit reminders');
      }
    } catch (error: any) {
      console.error('Error toggling notifications:', error);
      setEnabled(!value); // Revert on error
      Alert.alert('Error', error.message || 'Failed to update notification settings');
    }
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate && userId) {
      setTime(selectedDate);

      // If notifications are enabled, reschedule with new time
      if (enabled) {
        try {
          const hour = selectedDate.getHours();
          const minute = selectedDate.getMinutes();
          await scheduleDailyReminder(userId, hour, minute);
          Alert.alert(
            'Time Updated',
            `Reminder time updated to ${formatTime(hour, minute)}`
          );
        } catch (error) {
          console.error('Error updating notification time:', error);
          Alert.alert('Error', 'Failed to update reminder time');
        }
      }
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert(
        'Test Sent!',
        'Check your notification center to see how reminders will appear'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send test notification');
    }
  };

  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Daily Habit Reminders</Text>
            <Text style={styles.description}>
              Get reminded to complete your habits
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#ccc', true: '#667eea' }}
            thumbColor={enabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {enabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeText}>
                {formatTime(time.getHours(), time.getMinutes())}
              </Text>
              <Text style={styles.timeLabel}>Tap to change</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Text style={styles.testButtonText}>🔔 Send Test Notification</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Tip: Reminders are only sent if you haven't completed all your habits for the day
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timeButton: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  testButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

