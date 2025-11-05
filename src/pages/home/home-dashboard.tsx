import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image, Alert } from "react-native";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useFocusEffect } from "@react-navigation/native";
import commonConstants from "src/themes/constants";
import { useXPRewards } from "src/hooks/useXPRewards";

// Firebase services
import { getUserProfile, updateStreak, UserProfile } from "src/services/firebase/user";
import { getHabits, getStreak, getCompletions, completeHabit, uncompleteHabit, Habit, Streak } from "src/services/firebase/habits";
import { getJournalEntries, hasJournaledToday } from "src/services/firebase/journal";
import { getActiveWorkoutPlans, WorkoutPlanProgress, WorkoutPlan } from "src/services/firebase/workout-plans";
import { getTodayMeditations, getMeditationStats } from "src/services/firebase/meditation";

// Local data
import quotesData from "src/data/quotes.json";

// Utils
import { getPercentile, getTierName } from "src/utils/xpPercentileMapper";

// Debug overlay

export const HomeDashboard = ({ navigation }: { navigation: any }) => {
  const { user, userId } = useFirebaseUser();
  const { checkAllHabitsCompleted } = useXPRewards();
  
  // State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [journaledToday, setJournaledToday] = useState(false);
  const [activePlans, setActivePlans] = useState<(WorkoutPlanProgress & { plan: WorkoutPlan })[]>([]);
  const [meditatedToday, setMeditatedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  
  // Get daily rotating quote (changes each day)
  const getDailyQuote = () => {
    const quotes = quotesData.quotes;
    // Use today's date as seed for consistent daily quote
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % quotes.length;
    return quotes[index];
  };
  
  const dailyQuote = getDailyQuote();

  const fetchUserData = async () => {
    try {
      if (!userId) return;

      const [profileData, habitsData, streakData, completionsData, journaledCheck, activePlansData, meditationsToday] = await Promise.all([
        getUserProfile(userId),
        getHabits(userId),
        getStreak(userId),
        getCompletions(userId, today, today),
        hasJournaledToday(userId),
        getActiveWorkoutPlans(userId),
        getTodayMeditations(userId),
      ]);

      setUserProfile(profileData);
      setHabits(habitsData);
      setStreak(streakData);
      
      // Filter completions to only include existing habits
      const existingHabitIds = new Set(habitsData.map(h => h.id));
      const validCompletions = completionsData.filter(c => existingHabitIds.has(c.habitId));
      setCompletedToday(new Set(validCompletions.map(c => c.habitId)));
      
      setJournaledToday(journaledCheck);
      setActivePlans(activePlansData);
      setMeditatedToday(meditationsToday.length > 0);
      
      // Update streak on app open
      if (profileData) {
        await updateStreak(userId);
      }
    } catch (err: any) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [userId])
  );

  // Check for day change and refresh habits
  useEffect(() => {
    const checkDayChange = setInterval(() => {
      const currentDay = new Date().toISOString().split('T')[0];
      if (currentDay !== today) {
        console.log('🔄 Day changed - refreshing habits');
        fetchUserData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkDayChange);
  }, [today]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  // Handle habit completion toggle
  const handleToggleHabit = async (habitId: string, isCompleted: boolean, e: any) => {
    e.stopPropagation(); // Prevent navigation
    
    try {
      if (!userId) return;

      const today = new Date().toISOString().split('T')[0];

      if (isCompleted) {
        await uncompleteHabit(userId, habitId, today);
        setCompletedToday(prev => {
          const newSet = new Set(prev);
          newSet.delete(habitId);
          return newSet;
        });
      } else {
        await completeHabit(userId, habitId);
        const newCompletedSet = new Set(completedToday).add(habitId);
        setCompletedToday(newCompletedSet);
        
        // Check if all habits are now completed
        if (newCompletedSet.size === habits.length && habits.length > 0) {
          const allCompleted = await checkAllHabitsCompleted();
          if (allCompleted) {
            Alert.alert('🎉 All Habits Complete!', 'You completed all your habits today!\n\n+15 XP bonus! 🌟');
          }
        }
      }
      
      // Immediately refresh streak after completion/uncompletion
      const updatedStreak = await getStreak(userId);
      setStreak(updatedStreak);
    } catch (err: any) {
      console.error('Error toggling habit:', err);
      // Silently refresh if already completed
      if (err.message?.includes('already completed')) {
        fetchUserData();
      }
    }
  };

  // Calculate completion percentage
  const completionPercentage = habits.length > 0 
    ? Math.round((completedToday.size / habits.length) * 100)
    : 0;

  // Get days of week with completion status
  const getDaysOfWeek = () => {
    const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const today = new Date().getDay(); // 0 = Sunday
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to Monday = 0
    
    return days.map((day, index) => ({
      day,
      isToday: index === todayIndex,
      isCompleted: index === todayIndex && completedToday.size === habits.length && habits.length > 0,
    }));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('PersonalDetails')}>
          <Image
            source={
              userProfile?.profilePictureUrl
                ? { uri: userProfile.profilePictureUrl }
                : require('../../../assets/blank-profile-picture.png')
            }
            style={styles.profilePic}
          />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.userName}>{userProfile?.username || 'User'}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

      {/* Dynamic Percentile Badge with XP */}
      {userProfile && (
        <View style={styles.percentileBadge}>
          <View style={styles.percentileBadgeTop}>
            <Text style={styles.percentileText}>
              🌍 Top {getPercentile(userProfile.xp || 0)}% of Self-Improvers Worldwide
            </Text>
          </View>
          <View style={styles.percentileStats}>
            <View style={styles.percentileStat}>
              <Text style={styles.percentileStatValue}>⚡ {userProfile.xp || 0}</Text>
              <Text style={styles.percentileStatLabel}>XP</Text>
            </View>
            <View style={styles.percentileStatDivider} />
            <View style={styles.percentileStat}>
              <Text style={styles.percentileStatValue}>🎖️ {userProfile.level || 1}</Text>
              <Text style={styles.percentileStatLabel}>{getTierName(userProfile.xp || 0)}</Text>
            </View>
            <View style={styles.percentileStatDivider} />
            <View style={styles.percentileStat}>
              <Text style={styles.percentileStatValue}>🔥 {streak?.currentStreak || 0}</Text>
              <Text style={styles.percentileStatLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
      )}

      {/* Daily Inspirational Quote */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteIcon}>💡</Text>
        <View style={styles.quoteContent}>
          <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
        </View>
      </View>

      {/* Habits for Today Card */}
      <View style={styles.habitsCard}>
        <View style={styles.habitsHeader}>
          <View style={styles.habitsHeaderLeft}>
            <Text style={styles.habitsTitle}>Today's Habits</Text>
            <Text style={styles.habitsSubtitle}>
              {completedToday.size} of {habits.length} complete
            </Text>
          </View>
          {streak && streak.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>{streak.currentStreak}</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressBarText}>{completionPercentage}%</Text>
        </View>

        {/* Habit List */}
        {habits.length > 0 ? (
          <View style={styles.habitsList}>
            {habits.slice(0, 4).map((habit) => {
              const isCompleted = completedToday.has(habit.id!);
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={styles.habitItem}
                  onPress={(e) => handleToggleHabit(habit.id!, isCompleted, e)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.habitCheckbox, isCompleted && styles.habitCheckboxCompleted]}>
                    {isCompleted && <Text style={styles.habitCheckmark}>✓</Text>}
                  </View>
                  <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>
                    {habit.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {habits.length > 4 && (
              <Text style={styles.moreHabitsText}>
                +{habits.length - 4} more habits
              </Text>
            )}
            
            {/* Manage Habits Button */}
            <TouchableOpacity 
              style={styles.manageHabitsButton}
              onPress={() => navigation.navigate('Habits')}
            >
              <Text style={styles.manageHabitsText}>
                Manage Habits →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.noHabitsButton}
            onPress={() => navigation.navigate('Habits')}
          >
            <Text style={styles.noHabitsText}>+ Add your first habit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Widget Grid */}
      <View style={styles.widgetGrid}>
        {/* Journal Widget */}
        <TouchableOpacity 
          style={[styles.widget, styles.journalWidget]}
          onPress={() => navigation.navigate('Journal')}
        >
          <Text style={styles.widgetIcon}>📓</Text>
          <Text style={styles.widgetTitle}>Journal</Text>
          <Text style={styles.widgetSubtitle}>
            {journaledToday ? '✓ Journaled today' : 'Reflect on your journey'}
          </Text>
        </TouchableOpacity>

        {/* Meditation Widget */}
        <TouchableOpacity 
          style={[styles.widget, styles.meditationWidget]}
          onPress={() => navigation.navigate('Meditation')}
        >
          <Text style={styles.widgetIcon}>🧘‍♂️</Text>
          <Text style={styles.widgetTitle}>Meditation</Text>
          <Text style={styles.widgetSubtitle}>
            {meditatedToday ? '✓ Meditated today' : 'Take a moment to breathe'}
          </Text>
        </TouchableOpacity>

        {/* Workout Widget */}
        <TouchableOpacity 
          style={[styles.widget, styles.workoutWidget]}
          onPress={() => navigation.navigate('WorkoutPlans')}
        >
          <Text style={styles.widgetIcon}>💪</Text>
          <Text style={styles.widgetTitle}>Workouts</Text>
          <Text style={styles.widgetSubtitle}>
            {activePlans.length > 0 
              ? `Active: ${activePlans[0].plan.name.substring(0, 20)}${activePlans[0].plan.name.length > 20 ? '...' : ''}` 
              : 'Browse workout plans'}
          </Text>
        </TouchableOpacity>

        {/* Nutrition Widget */}
        <TouchableOpacity 
          style={[styles.widget, styles.nutritionWidget]}
          onPress={() => navigation.navigate('Recipes')}
        >
          <Text style={styles.widgetIcon}>🥗</Text>
          <Text style={styles.widgetTitle}>Nutrition</Text>
          <Text style={styles.widgetSubtitle}>Discover healthy recipes</Text>
        </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#e8eaf6',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    flex: 1,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsIcon: {
    fontSize: 18,
  },
  welcomeText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.3,
  },
  percentileBadge: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#86efac',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  percentileBadgeTop: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#dcfce7',
  },
  percentileText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  percentileStats: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  percentileStat: {
    flex: 1,
    alignItems: 'center',
  },
  percentileStatValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#166534',
    marginBottom: 2,
  },
  percentileStatLabel: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  percentileStatDivider: {
    width: 1,
    backgroundColor: '#86efac',
    marginHorizontal: 12,
  },
  quoteContainer: {
    flexDirection: 'row',
    background: 'linear-gradient(135deg, #ffe4c4 0%, #ffdab9 100%)',
    backgroundColor: '#ffd7b5', // Fallback - Soft faded orange
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#ffb380',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quoteIcon: {
    fontSize: 28,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#5d4037',
    lineHeight: 20,
    marginBottom: 6,
    fontWeight: '700',
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#8d6e63',
    fontWeight: '700',
  },
  habitsCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 20,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea', // Fallback for React Native
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0,
  },
  habitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  habitsHeaderLeft: {
    flex: 1,
  },
  habitsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 3,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  habitsSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  streakIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressBarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    minWidth: 38,
    textAlign: 'right',
  },
  habitsList: {
    gap: 8,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  habitCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  habitCheckboxCompleted: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  habitCheckmark: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
  },
  habitName: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  habitNameCompleted: {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through',
  },
  moreHabitsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  manageHabitsButton: {
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  manageHabitsText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  noHabitsButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  noHabitsText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 15,
  },
  widget: {
    width: 'calc(50% - 6px)',
    minWidth: 150,
    flex: 1,
    maxWidth: '48%',
    aspectRatio: 1.4,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  journalWidget: {
    background: 'linear-gradient(135deg, #ffd54f 0%, #ffab00 100%)',
    backgroundColor: '#ffd54f',
  },
  meditationWidget: {
    background: 'linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%)',
    backgroundColor: '#9c27b0',
  },
  workoutWidget: {
    background: 'linear-gradient(135deg, #26c6da 0%, #00acc1 100%)',
    backgroundColor: '#26c6da',
  },
  nutritionWidget: {
    background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
    backgroundColor: '#66bb6a',
  },
  widgetIcon: {
    fontSize: 32,
    alignSelf: 'flex-start',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  widgetSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.95,
    lineHeight: 16,
    fontWeight: '500',
  },
});

