import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Button, ButtonTypes } from "src/components/common/button-simple";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useXPRewards } from "src/hooks/useXPRewards";
import moment from "moment";

// Firebase services
import { getHabits, completeHabit, uncompleteHabit, deleteHabit, Habit, getCompletions, getStreak, Streak } from "src/services/firebase/habits";

export const HabitsScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  const { checkAllHabitsCompleted } = useXPRewards();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedForDate, setCompletedForDate] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  const today = moment().format('YYYY-MM-DD');
  const isToday = selectedDate === today;
  const gracePeriodStart = moment().subtract(3, 'days').format('YYYY-MM-DD');

  const fetchHabits = async () => {
    try {
      if (!userId) {
        console.log('No user ID available');
        return;
      }

      console.log('Fetching habits for user:', userId, 'date:', selectedDate);
      
      // Fetch habits, completions, and streak
      const [habitsData, completionsData, streakData] = await Promise.all([
        getHabits(userId),
        getCompletions(userId, selectedDate, selectedDate),
        getStreak(userId),
      ]);

      console.log('Habits:', habitsData.length);
      console.log('Completions for', selectedDate, ':', completionsData.length);
      console.log('Streak:', streakData);

      // Filter habits to only show those created on or before the selected date
      const filteredHabits = habitsData.filter(habit => {
        if (!habit.createdAt) return true; // Show habits without creation date
        
        const habitCreatedDate = moment(habit.createdAt.toDate()).format('YYYY-MM-DD');
        return habitCreatedDate <= selectedDate;
      });

      console.log('Filtered habits for date:', filteredHabits.length);
      setHabits(filteredHabits);
      setStreak(streakData);
      
      // Create set of existing habit IDs
      const existingHabitIds = new Set(habitsData.map(h => h.id));
      
      // Filter completions to only include existing habits
      const validCompletions = completionsData.filter(c => existingHabitIds.has(c.habitId));
      console.log('Valid completions (filtered):', validCompletions.length);
      
      // Create set of completed habit IDs (only for existing habits)
      const completedIds = new Set(validCompletions.map(c => c.habitId));
      setCompletedForDate(completedIds);
      
      setError("");
    } catch (err: any) {
      console.error('Error fetching habits:', err);
      setError(err.message || 'Failed to load habits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [userId, selectedDate]);

  // Reset to today and refresh habits when screen is focused (e.g., after adding a new habit)
  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate(moment().format('YYYY-MM-DD'));
      fetchHabits(); // Refresh habits list when screen comes into focus
    }, [userId, selectedDate])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHabits();
  };

  const handleCompleteHabit = async (habitId: string, habitName: string) => {
    try {
      if (!userId) return;

      const isCompleted = completedForDate.has(habitId);

      if (isCompleted) {
        // Uncomplete - update Firebase first, then UI
        await uncompleteHabit(userId, habitId, selectedDate);
        setCompletedForDate(prev => {
          const newSet = new Set(prev);
          newSet.delete(habitId);
          return newSet;
        });
        console.log(`Uncompleted: ${habitName} for ${selectedDate}`);
        
        // Immediately refresh streak after uncompletion
        const updatedStreak = await getStreak(userId);
        setStreak(updatedStreak);
      } else {
        // Complete - update Firebase first, then UI
        await completeHabit(userId, habitId, selectedDate);
        
        // Only update UI if Firebase operation succeeded
        setCompletedForDate(prev => new Set(prev).add(habitId));
        console.log(`Completed: ${habitName} for ${selectedDate}`);
        
        // Immediately refresh streak after completion
        const updatedStreak = await getStreak(userId);
        setStreak(updatedStreak);
        
        // Only award bonus XP if completing for today
        if (isToday) {
          const newCompletedSet = new Set(completedForDate).add(habitId);
          if (newCompletedSet.size === habits.length && habits.length > 0) {
            const allCompleted = await checkAllHabitsCompleted();
            if (allCompleted) {
              Alert.alert('🎉 All Habits Complete!', 'You completed all your habits today!\n\n+15 XP bonus! 🌟');
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Error toggling habit:', err);
      // Don't show alert for "already completed" errors - just refresh data instead
      if (err.message && err.message.includes('already completed')) {
        console.log('Habit already completed, refreshing data...');
        fetchHabits(); // Refresh to sync UI with actual state
      } else {
        Alert.alert('Error', err.message || 'Failed to update habit');
      }
    }
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!userId) return;
              await deleteHabit(userId, habitId);
              
              // Update habits list
              setHabits(prev => prev.filter(h => h.id !== habitId));
              
              // Also remove from completedForDate if it was completed
              setCompletedForDate(prev => {
                const newSet = new Set(prev);
                newSet.delete(habitId);
                return newSet;
              });
              
              console.log(`Deleted: ${habitName}`);
            } catch (err: any) {
              console.error('Error deleting habit:', err);
              Alert.alert('Error', err.message || 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const goToPreviousDay = () => {
    const previousDay = moment(selectedDate).subtract(1, 'day');
    console.log('Attempting to go to previous day:', previousDay.format('YYYY-MM-DD'));
    console.log('Grace period start:', gracePeriodStart);
    console.log('Is before grace period?', previousDay.isBefore(gracePeriodStart));
    
    if (previousDay.isBefore(gracePeriodStart)) {
      Alert.alert('Grace Period', 'You can only edit habits from the last 3 days');
      return;
    }
    setSelectedDate(previousDay.format('YYYY-MM-DD'));
  };

  const goToNextDay = () => {
    const nextDay = moment(selectedDate).add(1, 'day');
    if (nextDay.isAfter(today, 'day')) {
      Alert.alert('Future Date', 'You cannot complete habits for future dates');
      return;
    }
    setSelectedDate(nextDay.format('YYYY-MM-DD'));
  };

  const goToToday = () => {
    setSelectedDate(today);
  };

  const getDateDisplay = () => {
    const date = moment(selectedDate);
    if (selectedDate === today) return 'Today';
    if (selectedDate === moment().subtract(1, 'day').format('YYYY-MM-DD')) return 'Yesterday';
    return date.format('MMM D');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading habits...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Button
          type={ButtonTypes.Primary}
          title="Retry"
          onPress={fetchHabits}
          style={{ marginTop: 20, width: 200 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Habits</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity 
            onPress={goToPreviousDay}
            style={styles.dateNavButton}
            disabled={moment(selectedDate).isSameOrBefore(gracePeriodStart)}
          >
            <Text style={[
              styles.dateNavButtonText,
              moment(selectedDate).isSameOrBefore(gracePeriodStart) && styles.dateNavButtonDisabled
            ]}>
              ←
            </Text>
          </TouchableOpacity>

          <View style={styles.dateDisplayContainer}>
            <Text style={styles.dateDisplay}>{getDateDisplay()}</Text>
            <Text style={styles.dateSubtext}>{moment(selectedDate).format('dddd, MMMM D')}</Text>
            {!isToday && (
              <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
                <Text style={styles.todayButtonText}>Jump to Today</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            onPress={goToNextDay}
            style={styles.dateNavButton}
            disabled={moment(selectedDate).isSameOrAfter(today)}
          >
            <Text style={[
              styles.dateNavButtonText,
              moment(selectedDate).isSameOrAfter(today) && styles.dateNavButtonDisabled
            ]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            {/* Selected Date Progress */}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedForDate.size}/{habits.length}</Text>
              <Text style={styles.statLabel}>{isToday ? 'Today' : getDateDisplay()}</Text>
            </View>
            
            {/* Streak */}
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                🔥 {streak?.currentStreak || 0}
              </Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            {/* Best Streak */}
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ⭐ {streak?.longestStreak || 0}
              </Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${habits.length > 0 ? Math.round((completedForDate.size / habits.length) * 100) : 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressPercent}>
              {habits.length > 0 ? Math.round((completedForDate.size / habits.length) * 100) : 0}%
            </Text>
          </View>
        </View>

        {/* Habits List Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Habits</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddHabit')}>
            <Text style={styles.addButtonSmall}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Habits List */}
        {habits.length > 0 ? (
          <View style={styles.habitsList}>
            {habits.map((habit) => {
              const isCompleted = completedForDate.has(habit.id!);
              return (
                <View key={habit.id} style={styles.habitItemWrapper}>
                  <TouchableOpacity
                    style={[styles.habitItem, isCompleted && styles.habitItemCompleted]}
                    onPress={() => handleCompleteHabit(habit.id!, habit.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.habitItemLeft}>
                      <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
                        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.habitInfo}>
                        <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>
                          {habit.name}
                        </Text>
                        {habit.description && (
                          <Text style={styles.habitDescription}>{habit.description}</Text>
                        )}
                        <View style={styles.habitMeta}>
                          {habit.category && (
                            <Text style={styles.habitCategory}>📁 {habit.category}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    
                    {/* Delete Button */}
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteHabit(habit.id!, habit.name)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No habits yet!</Text>
            <Text style={styles.emptyStateText}>
              Start building your routine by adding your first habit.
            </Text>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tips}>
          <Text style={styles.tipsText}>
            💡 Tap habit to complete • Tap 🗑️ to delete
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNavButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  dateNavButtonDisabled: {
    opacity: 0.3,
  },
  dateDisplayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dateDisplay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateSubtext: {
    fontSize: 13,
    color: '#666',
  },
  todayButton: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  todayButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
    minWidth: 42,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  addButtonSmall: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '700',
  },
  habitsList: {
    marginBottom: 20,
  },
  habitItemWrapper: {
    marginBottom: 10,
  },
  habitItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  habitItemCompleted: {
    backgroundColor: '#f0f9ff',
  },
  habitItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#667eea',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxCompleted: {
    backgroundColor: '#667eea',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  habitNameCompleted: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  habitDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitCategory: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tips: {
    padding: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipsText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
});
