import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { serverTimestamp } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { Button, ButtonTypes } from "src/components/common/button-simple";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useXPRewards } from "src/hooks/useXPRewards";
import { useBranding } from "src/hooks/useBranding";
import moment from "moment";

// Firebase services
import { getHabits, completeHabit, uncompleteHabit, deleteHabit, Habit, getCompletions, getStreak, Streak } from "src/services/firebase/habits";
import { getGoals, Goal, updateGoalProgress, updateGoal, deleteGoal } from "src/services/firebase/goals";
import { addXP } from "src/services/firebase/user";
import { syncAfterHabitCompletion, syncAfterGoalUpdate, syncWidgetData } from "src/services/widget-data-sync";

export const HabitsScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  const { checkAllHabitsCompleted } = useXPRewards();
  const { primaryColor, isBranded } = useBranding();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedForDate, setCompletedForDate] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState<Streak | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [completingGoalId, setCompletingGoalId] = useState<string | null>(null);
  const [showCompletedGoals, setShowCompletedGoals] = useState(false);
  const [clearingCompletedGoals, setClearingCompletedGoals] = useState(false);
  const handleCompleteGoalManually = (goalId: string, goalTitle: string) => {
    if (!userId) {
      Alert.alert('Error', 'Please log in again.');
      return;
    }

    Alert.alert(
      'Mark Goal Complete',
      `Are you sure you want to mark "${goalTitle}" as complete?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish Goal',
          style: 'destructive',
          onPress: async () => {
            try {
              setCompletingGoalId(goalId);
              
              // Check if goal was already completed to avoid double XP
              const currentGoal = await getGoals(userId).then(goals => goals.find(g => g.id === goalId));
              const wasAlreadyCompleted = currentGoal?.completed;
              
              await updateGoal(userId, goalId, {
                completed: true,
                completedAt: serverTimestamp(),
              });
              
              // Award XP only if goal wasn't already completed
              if (!wasAlreadyCompleted) {
                await addXP(userId, 50);
              }
              
              const updatedGoals = await getGoals(userId);
              setGoals(updatedGoals);
              Alert.alert(
                'Goal Complete!', 
                `🎉 "${goalTitle}" marked as complete!${!wasAlreadyCompleted ? '\n\n+50 XP earned! 🌟' : ''}`
              );
            } catch (error: any) {
              console.error('Manual goal complete error:', error);
              Alert.alert('Error', error.message || 'Failed to complete goal');
            } finally {
              setCompletingGoalId(null);
            }
          },
        },
      ]
    );
  };

  const handleClearCompletedGoals = async () => {
    if (!userId || completedGoals.length === 0) return;

    Alert.alert(
      'Clear Completed Goals',
      'This will remove all completed goals permanently. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearingCompletedGoals(true);
              await Promise.all(completedGoals.map(goal => deleteGoal(userId, goal.id!)));
              const refreshedGoals = await getGoals(userId);
              setGoals(refreshedGoals);
              setShowCompletedGoals(false);
            } catch (error: any) {
              console.error('Error clearing completed goals:', error);
              Alert.alert('Error', error.message || 'Failed to clear completed goals');
            } finally {
              setClearingCompletedGoals(false);
            }
          },
        },
      ]
    );
  };

  const today = moment().format('YYYY-MM-DD');
  const isToday = selectedDate === today;
  const gracePeriodStart = moment().subtract(3, 'days').format('YYYY-MM-DD');

  const activeGoals = useMemo(() => goals.filter(goal => !goal.completed), [goals]);
  const completedGoals = useMemo(() => goals.filter(goal => goal.completed), [goals]);
  const visibleHabits = habits;

  const fetchHabits = async () => {
    try {
      if (!userId) {
        console.log('No user ID available');
        return;
      }

      console.log('Fetching habits for user:', userId, 'date:', selectedDate);
      
      // Fetch habits, completions, streak, and goals
      const [habitsData, completionsData, streakData, goalsData] = await Promise.all([
        getHabits(userId),
        getCompletions(userId, selectedDate, selectedDate),
        getStreak(userId),
        getGoals(userId),
      ]);
      
      // Sync widget data (non-blocking)
      syncWidgetData(userId).catch(err => console.error('Widget sync error:', err));

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
      setGoals(goalsData);
      
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

  // Refresh habits when screen is focused (e.g., after adding a new habit)
  // Also check if the day has changed and reset to today if needed
  useFocusEffect(
    React.useCallback(() => {
      const currentToday = moment().format('YYYY-MM-DD');
      
      // If it's a new day and user was viewing "today" (or yesterday which was today),
      // reset to the actual current day
      // This handles the case where the app stays open overnight
      if (selectedDate !== currentToday) {
        const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
        
        // If user was viewing what was previously "today" (now yesterday),
        // auto-switch to the new today
        if (selectedDate === yesterday || selectedDate < yesterday) {
          console.log('📅 New day detected, resetting to today:', currentToday);
          setSelectedDate(currentToday);
          // fetchHabits will be called by the useEffect when selectedDate changes
          return;
        }
      }
      
      // Refresh habits list when screen comes into focus
      fetchHabits();
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
        
        // Refresh streak and goals after uncompletion - add small delay to ensure Firestore write completes
        setTimeout(async () => {
          try {
            const [updatedStreak, updatedGoals] = await Promise.all([
              getStreak(userId),
              getGoals(userId),
            ]);
            setStreak(updatedStreak);
            setGoals(updatedGoals);
            // Sync widget data after uncompletion
            syncAfterHabitCompletion(userId);
          } catch (error) {
            console.error('Error fetching updated streak/goals:', error);
          }
        }, 500);
      } else {
        // Complete - check if already completed first to prevent duplicate goal progress
        let wasAlreadyCompleted = false;
        let completedGoals: string[] = [];
        
        try {
          // Try to complete - this will throw if already completed
          await completeHabit(userId, habitId, selectedDate);
          
          // Only update goal progress if habit wasn't already completed
          try {
            completedGoals = await updateGoalProgress(userId, habitId);
            // Refresh goals to show updated progress
            const updatedGoals = await getGoals(userId);
            setGoals(updatedGoals);
            // Sync widget data after goal update
            syncAfterGoalUpdate(userId);
          } catch (error) {
            console.error('Error updating goal progress:', error);
            // Don't block habit completion if goal update fails
          }
          
          // Sync widget data after habit completion
          syncAfterHabitCompletion(userId);
        } catch (err: any) {
          if (err.message && err.message.includes('already completed')) {
            wasAlreadyCompleted = true;
            console.log('Habit already completed, skipping goal progress update');
          } else {
            // Other error - show error and return
            Alert.alert('Error', err.message || 'Failed to complete habit. Please try again.');
            return;
          }
        }
        
        // Update UI optimistically after Firebase succeeds (or if already completed)
        setCompletedForDate(prev => new Set(prev).add(habitId));
        console.log(`Completed: ${habitName} for ${selectedDate}`);
        
        // Only refresh streak when ALL habits are complete for today
        // This prevents the streak from flickering to 0 during partial completion
        const newCompletedCount = completedForDate.size + 1;
        const willBeAllComplete = newCompletedCount === habits.length && habits.length > 0;
        
        // Award bonus XP if completing for today - only show alert if XP was actually awarded
        if (isToday && willBeAllComplete) {
          // Check if XP was awarded (only awards once per day)
          const xpAwarded = await checkAllHabitsCompleted();
          
          if (xpAwarded) {
            // Show XP alert only if XP was actually awarded
            Alert.alert('🎉 All Habits Complete!', 'You completed all your habits today!\n\n+15 XP bonus! 🌟');
          }
          
          // All habits will be complete - refresh streak after a delay
          // to allow Firebase to process the completion
          setTimeout(async () => {
            try {
              const updatedStreak = await getStreak(userId);
              if (updatedStreak) {
                setStreak(updatedStreak);
              }
            } catch (error) {
              console.error('Error fetching updated streak:', error);
            }
          }, 500); // Wait 0.5s for Firebase to update
        }
        // If not all habits complete, keep existing streak displayed (don't refresh)
        
        // Check if any goals were completed
        if (completedGoals.length > 0) {
          const goalMessage = completedGoals.length === 1
            ? `🎉 Goal Achieved!\n\n"${completedGoals[0]}"\n\nCongratulations on reaching your goal!\n\n+50 XP earned! 🌟`
            : `🎉 Goals Achieved!\n\nYou completed ${completedGoals.length} goals:\n${completedGoals.map(g => `• ${g}`).join('\n')}\n\n+${50 * completedGoals.length} XP earned! 🌟`;
          
          Alert.alert('Goal Complete!', goalMessage);
          
          // Refresh goals to show updated state
          if (userId) {
            const updatedGoals = await getGoals(userId);
            setGoals(updatedGoals);
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
        <ActivityIndicator size="large" color={primaryColor} />
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
          primaryColor={primaryColor}
          style={{ marginTop: 20, width: 200 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isBranded && { borderBottomWidth: 3, borderBottomColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText} allowFontScaling={false}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} allowFontScaling={false}>My Habits</Text>
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
            onPress={() => {
              console.log('⬅️ LEFT ARROW PRESSED');
              goToPreviousDay();
            }}
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
            <Text style={styles.dateDisplay} allowFontScaling={false}>{getDateDisplay()}</Text>
            <Text style={styles.dateSubtext} allowFontScaling={false}>{moment(selectedDate).format('dddd, MMMM D')}</Text>
            {!isToday && (
              <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
                <Text style={styles.todayButtonText} allowFontScaling={false}>Jump to Today</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            onPress={() => {
              console.log('➡️ RIGHT ARROW PRESSED');
              goToNextDay();
            }}
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
              <Text style={styles.statValue} allowFontScaling={false}>{completedForDate.size}/{habits.length}</Text>
              <Text style={styles.statLabel} allowFontScaling={false}>{isToday ? 'Today' : getDateDisplay()}</Text>
            </View>
            
            {/* Streak */}
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue} allowFontScaling={false}>
                🔥 {streak?.currentStreak || 0}
              </Text>
              <Text style={styles.statLabel} allowFontScaling={false}>Day Streak</Text>
            </View>
            
            {/* Best Streak */}
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue} allowFontScaling={false}>
                ⭐ {streak?.longestStreak || 0}
              </Text>
              <Text style={styles.statLabel} allowFontScaling={false}>Best Streak</Text>
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
            <Text style={styles.progressPercent} allowFontScaling={false}>
              {habits.length > 0 ? Math.round((completedForDate.size / habits.length) * 100) : 0}%
            </Text>
          </View>
        </View>

        {/* Goals Section */}
        {(activeGoals.length > 0 || completedGoals.length > 0) && (
          <View style={styles.goalsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} allowFontScaling={false}>🎯 Goals</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddGoal')}>
                <Text style={styles.addButtonSmall} allowFontScaling={false}>+ Add</Text>
              </TouchableOpacity>
            </View>
            
            {activeGoals.length > 0 ? activeGoals.map((goal) => {
              const progressPercent = goal.targetCompletions 
                ? Math.min((goal.currentProgress / goal.targetCompletions) * 100, 100)
                : 0;
              
              return (
                <View key={goal.id} style={[styles.goalCard, goal.completed && styles.goalCardCompleted]}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleRow}>
                      <View style={styles.goalTitleContainer}>
                        <Text style={styles.goalTitle} allowFontScaling={false}>{goal.title}</Text>
                        {goal.completed && (
                          <Text style={styles.goalCompletedBadge} allowFontScaling={false}>✓ Completed</Text>
                        )}
                      </View>
                      {goal.linkedHabitIds.length > 0 && (
                        <View style={styles.goalHabitsBadge}>
                          <Text style={styles.goalHabitsIcon} allowFontScaling={false}>⚡</Text>
                          <Text style={styles.goalHabitsCount} allowFontScaling={false}>{goal.linkedHabitIds.length}</Text>
                        </View>
                      )}
                    </View>
                    {goal.description && (
                      <Text style={styles.goalDescription} allowFontScaling={false}>{goal.description}</Text>
                    )}
                  </View>
                  
                  {goal.targetCompletions && (
                    <View style={styles.goalProgress}>
                      <View style={styles.goalProgressBarBg}>
                        <View 
                          style={[
                            styles.goalProgressBarFill,
                            { width: `${progressPercent}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.goalProgressText} allowFontScaling={false}>
                        {goal.currentProgress} / {goal.targetCompletions} completions
                      </Text>
                    </View>
                  )}

                  {!goal.completed && (
                    <TouchableOpacity
                      style={styles.completeGoalButton}
                      onPress={() => handleCompleteGoalManually(goal.id!, goal.title)}
                      disabled={completingGoalId === goal.id}
                    >
                      <Text style={styles.completeGoalButtonText} allowFontScaling={false}>
                        {completingGoalId === goal.id ? 'Finishing…' : 'Finish Goal'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }) : (
              <View style={styles.emptyGoalsCard}>
                <Text style={styles.emptyGoalsTitle} allowFontScaling={false}>All goals complete! 🎉</Text>
                <Text style={styles.emptyGoalsText} allowFontScaling={false}>
                  Add a new goal to keep growing.
                </Text>
              </View>
            )}

            {completedGoals.length > 0 && (
              <View style={styles.completedGoalsSection}>
                <TouchableOpacity 
                  style={styles.completedGoalsHeader}
                  onPress={() => setShowCompletedGoals(prev => !prev)}
                >
                  <Text style={styles.completedGoalsTitle} allowFontScaling={false}>
                    ✅ Completed Goals ({completedGoals.length})
                  </Text>
                  <Text style={styles.completedGoalsToggle} allowFontScaling={false}>
                    {showCompletedGoals ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>

                {showCompletedGoals && (
                  <View style={styles.completedGoalsActions}>
                    <TouchableOpacity
                      style={[styles.clearCompletedButton, clearingCompletedGoals && styles.clearCompletedButtonDisabled]}
                      onPress={() => handleClearCompletedGoals()}
                      disabled={clearingCompletedGoals}
                    >
                      <Text style={styles.clearCompletedButtonText}>
                        {clearingCompletedGoals ? 'Clearing…' : 'Clear Completed'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {showCompletedGoals && (
                  <View style={styles.completedGoalsList}>
                    {completedGoals.map((goal) => (
                      <View key={goal.id} style={[styles.goalCard, styles.goalCardCompleted]}>
                        <View style={styles.goalHeader}>
                          <View style={styles.goalTitleRow}>
                            <View style={styles.goalTitleContainer}>
                              <Text style={styles.goalTitle}>{goal.title}</Text>
                              <Text style={styles.goalCompletedBadge}>✓ Completed</Text>
                            </View>
                          </View>
                          {goal.description && (
                            <Text style={styles.goalDescription}>{goal.description}</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Add Goal Button (if no goals) */}
        {goals.length === 0 && (
          <TouchableOpacity 
            style={styles.addGoalPill}
            onPress={() => navigation.navigate('AddGoal')}
          >
            <Text style={styles.addGoalPillText} allowFontScaling={false}>+ Create a goal</Text>
          </TouchableOpacity>
        )}

        {/* Habits List Title */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitleIcon} allowFontScaling={false}>⚡</Text>
            <Text style={styles.sectionTitle} allowFontScaling={false}>Your Habits</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddHabit')}>
            <Text style={styles.addButtonSmall} allowFontScaling={false}>+ Add</Text>
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
                        {isCompleted && <Text style={styles.checkmark} allowFontScaling={false}>✓</Text>}
                      </View>
                      <View style={styles.habitInfo}>
                        <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]} allowFontScaling={false}>
                          {habit.name}
                        </Text>
                        {habit.description && (
                          <Text style={styles.habitDescription} allowFontScaling={false}>{habit.description}</Text>
                        )}
                        <View style={styles.habitMeta}>
                          {habit.category && (
                            <Text style={styles.habitCategory} allowFontScaling={false}>📁 {habit.category}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                    
                    {/* Delete Button */}
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteHabit(habit.id!, habit.name)}
                    >
                      <Text style={styles.deleteButtonText} allowFontScaling={false}>🗑️</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle} allowFontScaling={false}>No habits yet!</Text>
            <Text style={styles.emptyStateText} allowFontScaling={false}>
              Start building your routine by adding your first habit.
            </Text>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tips}>
          <Text style={styles.tipsText} allowFontScaling={false}>
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
    paddingBottom: 40,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  dateNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  dateNavButtonText: {
    fontSize: 20,
    color: '#667eea',
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
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    marginBottom: 18,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  sectionTitleIcon: {
    fontSize: 22,
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
    padding: 18,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  habitItemCompleted: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  habitItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#667eea',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
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
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  emptyStateText: {
    fontSize: 15,
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
  goalsSection: {
    marginBottom: 30,
  },
  goalCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  goalCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 2,
  },
  goalHeader: {
    marginBottom: 8,
  },
  goalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  goalTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 8,
    lineHeight: 22,
  },
  goalCompletedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    lineHeight: 18,
  },
  goalProgress: {
    marginTop: 8,
  },
  goalProgressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  goalProgressBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  goalProgressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  completeGoalButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
  },
  completeGoalButtonText: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '700',
  },
  completedGoalsActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  clearCompletedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearCompletedButtonDisabled: {
    opacity: 0.6,
  },
  clearCompletedButtonText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  goalHabitsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  goalHabitsIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  goalHabitsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
  },
  emptyGoalsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyGoalsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptyGoalsText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
  },
  completedGoalsSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  completedGoalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  completedGoalsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  completedGoalsToggle: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },
  completedGoalsList: {
    marginTop: 10,
    gap: 10,
  },
  addGoalPill: {
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
  },
  addGoalPillText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 14,
  },
});
