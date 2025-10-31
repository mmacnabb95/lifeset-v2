import React, { useEffect, useState } from "react";
import { AppState, View, useWindowDimensions, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { setLanguage } from "src/redux/features/misc/slice";
import { Language } from "src/translations/types";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useFocusEffect } from "@react-navigation/native";
// Use simplified components to avoid runtime errors
import { Button, ButtonTypes } from "src/components/common/button-simple";
import commonConstants from "src/themes/constants";

// Firebase services
import { getUserProfile, updateStreak, UserProfile } from "src/services/firebase/user";
import { getHabits, getStreak, getCompletions, Habit, Streak } from "src/services/firebase/habits";
import { getJournalEntries, hasJournaledToday, JournalEntry } from "src/services/firebase/journal";
import { getTodayWorkouts, getWorkoutStats, WorkoutLog, WorkoutStats } from "src/services/firebase/workouts";
import { getActiveWorkoutPlans, WorkoutPlanProgress, WorkoutPlan } from "src/services/firebase/workout-plans";
import { getTodayMeditations, getMeditationStats, MeditationSession, MeditationStats } from "src/services/firebase/meditation";

// Local data
import recipesData from "src/data/recipes.json";
import quotesData from "src/data/quotes.json";

// Helper function for mood emojis
const getMoodEmoji = (mood: string) => {
  switch (mood) {
    case 'great': return '😄';
    case 'good': return '😊';
    case 'okay': return '😐';
    case 'bad': return '😔';
    case 'terrible': return '😢';
    default: return '😐';
  }
};

// HomeScreen with real Firebase data
export const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth >= commonConstants.avgDeviceSize;
  const dispatch = useDispatch();
  
  // Get current user from Redux
  const { user, userId } = useFirebaseUser();
  
  // State for Firebase data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [recentJournalEntries, setRecentJournalEntries] = useState<JournalEntry[]>([]);
  const [journaledToday, setJournaledToday] = useState(false);
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutLog[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [activePlans, setActivePlans] = useState<(WorkoutPlanProgress & { plan: WorkoutPlan })[]>([]);
  const [todayMeditations, setTodayMeditations] = useState<MeditationSession[]>([]);
  const [meditationStats, setMeditationStats] = useState<MeditationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>("");

  const today = new Date().toISOString().split('T')[0];
  
  // Get random recipes for display
  const featuredRecipes = recipesData.recipes.slice(0, 3);
  
  // Get random daily quote
  const getDailyQuote = () => {
    const quotes = quotesData.quotes;
    // Use today's date as seed for consistent daily quote
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % quotes.length;
    return quotes[index];
  };
  
  const dailyQuote = getDailyQuote();

  // Fetch user data from Firebase
  const fetchUserData = async () => {
    try {
      if (!userId) {
        console.log('No user ID available');
        return;
      }

      console.log('Fetching data for user:', userId);
      
      // Fetch all data in parallel
      const [profileData, habitsData, streakData, completionsData, journalData, journaledTodayCheck, workoutsToday, statsData] = await Promise.all([
        getUserProfile(userId),
        getHabits(userId),
        getStreak(userId),
        getCompletions(userId, today, today),
        getJournalEntries(userId, 3), // Get last 3 entries
        hasJournaledToday(userId),
        getTodayWorkouts(userId),
        getWorkoutStats(userId),
      ]);

      console.log('Profile data:', profileData);
      console.log('Habits count:', habitsData.length);
      console.log('Streak data:', streakData);
      console.log('Completions today:', completionsData.length);
      console.log('Journal entries:', journalData.length);
      console.log('Journaled today:', journaledTodayCheck);
      console.log('Workouts today:', workoutsToday.length);
      console.log('Workout stats:', statsData);

      // Fetch active workout plans
      const activePlansData = await getActiveWorkoutPlans(userId);
      console.log('Active plans:', activePlansData.length);

      // Fetch meditation data
      const todayMeditationsData = await getTodayMeditations(userId);
      const meditationStatsData = await getMeditationStats(userId);
      console.log('Meditations today:', todayMeditationsData.length);

      setUserProfile(profileData);
      setHabits(habitsData);
      setStreak(streakData);
      setRecentJournalEntries(journalData);
      setJournaledToday(journaledTodayCheck);
      setTodayWorkouts(workoutsToday);
      setWorkoutStats(statsData);
      setActivePlans(activePlansData);
      setTodayMeditations(todayMeditationsData);
      setMeditationStats(meditationStatsData);
      
      // Create set of completed habit IDs
      const completedIds = new Set(completionsData.map(c => c.habitId));
      setCompletedToday(completedIds);
      
      setError("");
      
      // Update streak on app open
      if (profileData) {
        await updateStreak(userId);
      }
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    console.log('HomeScreen mounted, userId:', userId);
    fetchUserData();
  }, [userId]);

  // Refresh when screen comes into focus (e.g., when navigating back)
  useFocusEffect(
    React.useCallback(() => {
      console.log('HomeScreen focused - refreshing data');
      fetchUserData();
    }, [userId])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your data...</Text>
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
          onPress={fetchUserData}
          style={{ marginTop: 20, width: 200 }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>🏠 Welcome back!</Text>
      <Text style={styles.subtitle}>
        {userProfile?.username || user?.displayName || user?.email || 'User'}
      </Text>
      
      {/* Daily Quote */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteIcon}>✨</Text>
        <View style={styles.quoteContent}>
          <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
        </View>
      </View>
      
      {/* Stats Container */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userProfile?.xp || 0}</Text>
          <Text style={styles.statLabel}>XP Points</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userProfile?.level || 1}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{streak?.currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Streak Days</Text>
        </View>
      </View>

      {/* Habits Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Your Habits Today</Text>
        <TouchableOpacity 
          style={styles.habitsSummary}
          onPress={() => navigation.navigate('Habits')}
          activeOpacity={0.7}
        >
          <Text style={styles.habitsCount}>
            {completedToday.size} of {habits.length} completed
          </Text>
          {habits.length > 0 ? (
            <View style={styles.habitsList}>
              {habits.slice(0, 3).map((habit) => {
                const isCompleted = completedToday.has(habit.id!);
                return (
                  <View key={habit.id} style={styles.habitItem}>
                    <View style={[styles.habitCheckbox, isCompleted && styles.habitCheckboxCompleted]}>
                      {isCompleted && <Text style={styles.habitCheckmark}>✓</Text>}
                    </View>
                    <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>
                      {habit.name}
                    </Text>
                  </View>
                );
              })}
              {habits.length > 3 && (
                <Text style={styles.moreHabits}>
                  +{habits.length - 3} more habits...
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.noHabits}>
              No habits yet. Tap to add some!
            </Text>
          )}
          
          {/* View All Button inside widget */}
          <TouchableOpacity 
            style={styles.viewAllHabitsButton}
            onPress={() => navigation.navigate('Habits')}
          >
            <Text style={styles.viewAllHabitsText}>View All Habits →</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Journal Widget */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Journal</Text>
        <View style={styles.journalWidget}>
          {journaledToday ? (
            <View style={styles.journalTodayCompleted}>
              <Text style={styles.journalCompletedIcon}>✓</Text>
              <Text style={styles.journalCompletedText}>Journaled today!</Text>
            </View>
          ) : (
            <View style={styles.journalTodayPending}>
              <Text style={styles.journalPendingIcon}>📝</Text>
              <Text style={styles.journalPendingText}>Haven't journaled yet today</Text>
            </View>
          )}
          
          {recentJournalEntries.length > 0 ? (
            <View style={styles.journalRecentEntries}>
              <Text style={styles.journalRecentTitle}>Recent Entries:</Text>
              {recentJournalEntries.map((entry) => (
                <View key={entry.id} style={styles.journalEntry}>
                  <Text style={styles.journalEntryDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.journalEntryContent} numberOfLines={2}>
                    {entry.content}
                  </Text>
                  {entry.mood && (
                    <Text style={styles.journalEntryMood}>
                      {getMoodEmoji(entry.mood)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noJournalEntries}>
              No journal entries yet. Start writing!
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.journalButton}
            onPress={() => navigation.navigate(journaledToday ? 'Journal' : 'WriteJournal')}
          >
            <Text style={styles.journalButtonText}>
              {journaledToday ? 'View Journal' : 'Write Entry'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Meditation Widget */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧘 Meditation</Text>
        <View style={styles.meditationWidget}>
          {todayMeditations.length > 0 ? (
            <View style={styles.meditationToday}>
              <Text style={styles.meditationTodayIcon}>✓</Text>
              <View style={styles.meditationTodayContent}>
                <Text style={styles.meditationTodayTitle}>
                  {todayMeditations.length} session{todayMeditations.length > 1 ? 's' : ''} today
                </Text>
                <Text style={styles.meditationTodaySubtitle}>
                  {todayMeditations.reduce((sum, s) => sum + s.duration, 0)} minutes total
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.meditationTodayPending}>
              <Text style={styles.meditationPendingIcon}>🧘</Text>
              <Text style={styles.meditationPendingText}>Take a moment to meditate today</Text>
            </View>
          )}

          {meditationStats && meditationStats.totalSessions > 0 && (
            <View style={styles.meditationStats}>
              <View style={styles.meditationStatItem}>
                <Text style={styles.meditationStatValue}>{meditationStats.thisWeek}</Text>
                <Text style={styles.meditationStatLabel}>This Week</Text>
              </View>
              <View style={styles.meditationStatDivider} />
              <View style={styles.meditationStatItem}>
                <Text style={styles.meditationStatValue}>{meditationStats.totalSessions}</Text>
                <Text style={styles.meditationStatLabel}>Total Sessions</Text>
              </View>
              <View style={styles.meditationStatDivider} />
              <View style={styles.meditationStatItem}>
                <Text style={styles.meditationStatValue}>{meditationStats.totalMinutes}</Text>
                <Text style={styles.meditationStatLabel}>Total Minutes</Text>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.meditationButton}
            onPress={() => navigation.navigate('Meditation')}
          >
            <Text style={styles.meditationButtonText}>Browse Meditations</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipe Browser Widget */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍽️ Recipe Portal</Text>
        <View style={styles.recipeWidget}>
          <Text style={styles.recipeSubtitle}>
            {recipesData.recipes.length} healthy recipes available
          </Text>
          
          {/* Featured Recipes */}
          <View style={styles.featuredRecipes}>
            {featuredRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
              >
                <View style={styles.recipeHeader}>
                  <Text style={styles.recipeCategory}>{recipe.category}</Text>
                  <Text style={styles.recipeDuration}>⏱️ {recipe.duration} min</Text>
                </View>
                <Text style={styles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
                <Text style={styles.recipeDescription} numberOfLines={2}>
                  {recipe.description}
                </Text>
                <View style={styles.recipeNutrition}>
                  <Text style={styles.nutritionBadge}>
                    {recipe.nutrition.calories} cal
                  </Text>
                  <Text style={styles.nutritionBadge}>
                    {recipe.nutrition.protein}g protein
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.recipeButton}
            onPress={() => navigation.navigate('Recipes')}
          >
            <Text style={styles.recipeButtonText}>Browse All Recipes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Workout Widget */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💪 Workouts</Text>
        <View style={styles.workoutWidget}>
          {/* Active Workout Plans */}
          {activePlans.length > 0 ? (
            <View style={styles.activePlansSection}>
              <Text style={styles.activePlansTitle}>Active Programs:</Text>
              {activePlans.slice(0, 2).map((progress) => {
                const percentComplete = Math.round(
                  (progress.completedWorkouts / progress.totalWorkoutsPlanned) * 100
                );
                return (
                  <TouchableOpacity
                    key={progress.id}
                    style={styles.activePlanCard}
                    onPress={() => navigation.navigate('WorkoutPlanDetail', { plan: progress.plan })}
                  >
                    <View style={styles.activePlanHeader}>
                      <Text style={styles.activePlanName}>{progress.plan.name}</Text>
                      <Text style={styles.activePlanProgress}>{percentComplete}%</Text>
                    </View>
                    <View style={styles.activePlanProgressBar}>
                      <View style={[styles.activePlanProgressFill, { width: `${percentComplete}%` }]} />
                    </View>
                    <Text style={styles.activePlanMeta}>
                      {progress.completedWorkouts} / {progress.totalWorkoutsPlanned} workouts • Week {Math.ceil(progress.completedWorkouts / progress.plan.daysPerWeek)} of {progress.plan.durationWeeks}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.noActivePlans}>
              <Text style={styles.noActivePlansText}>
                No active workout programs yet. Browse plans below to get started!
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.workoutButton}
            onPress={() => navigation.navigate('WorkoutPlans')}
          >
            <Text style={styles.workoutButtonText}>Browse Workout Plans</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Button */}
      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  quoteContainer: {
    flexDirection: 'row',
    backgroundColor: '#667eea',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quoteIcon: {
    fontSize: 32,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#fff',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#e0e7ff',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  habitsSummary: {
    marginTop: 10,
  },
  habitsCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '600',
  },
  habitsList: {
    marginTop: 10,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  habitCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitCheckboxCompleted: {
    backgroundColor: '#007AFF',
  },
  habitCheckmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  habitName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  habitNameCompleted: {
    color: '#007AFF',
  },
  moreHabits: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 10,
    fontStyle: 'italic',
  },
  noHabits: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  viewAllHabitsButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  viewAllHabitsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    padding: 20,
    paddingTop: 10,
  },
  settingsButton: {
    backgroundColor: '#757575',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  journalWidget: {
    marginTop: 10,
  },
  journalTodayCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  journalCompletedIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#4caf50',
  },
  journalCompletedText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  journalTodayPending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  journalPendingIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  journalPendingText: {
    fontSize: 16,
    color: '#e65100',
    fontWeight: '600',
  },
  journalRecentEntries: {
    marginBottom: 15,
  },
  journalRecentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  journalEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  journalEntryDate: {
    fontSize: 12,
    color: '#999',
    width: 60,
    fontWeight: '600',
  },
  journalEntryContent: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },
  journalEntryMood: {
    fontSize: 18,
  },
  noJournalEntries: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 15,
  },
  journalButton: {
    backgroundColor: '#9c27b0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  journalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  meditationWidget: {
    marginTop: 10,
  },
  meditationToday: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  meditationTodayIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#4caf50',
  },
  meditationTodayContent: {
    flex: 1,
  },
  meditationTodayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 2,
  },
  meditationTodaySubtitle: {
    fontSize: 14,
    color: '#66bb6a',
  },
  meditationTodayPending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  meditationPendingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  meditationPendingText: {
    fontSize: 14,
    color: '#e65100',
    fontWeight: '500',
  },
  meditationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  meditationStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  meditationStatDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  meditationStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#673ab7',
    marginBottom: 4,
  },
  meditationStatLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  meditationButton: {
    backgroundColor: '#673ab7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  meditationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recipeWidget: {
    marginTop: 10,
  },
  recipeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  featuredRecipes: {
    marginBottom: 15,
  },
  recipeCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeCategory: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recipeDuration: {
    fontSize: 12,
    color: '#666',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  recipeNutrition: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nutritionBadge: {
    fontSize: 12,
    color: '#4caf50',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    fontWeight: '600',
  },
  recipeButton: {
    backgroundColor: '#ff9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  recipeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutWidget: {
    marginTop: 10,
  },
  activePlansSection: {
    marginBottom: 15,
  },
  activePlansTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  activePlanCard: {
    backgroundColor: '#f3e5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#673ab7',
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activePlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activePlanProgress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#673ab7',
  },
  activePlanProgressBar: {
    height: 6,
    backgroundColor: '#e1bee7',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  activePlanProgressFill: {
    height: '100%',
    backgroundColor: '#673ab7',
  },
  activePlanMeta: {
    fontSize: 13,
    color: '#666',
  },
  noActivePlans: {
    backgroundColor: '#fff3e0',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  noActivePlansText: {
    fontSize: 14,
    color: '#e65100',
    textAlign: 'center',
    lineHeight: 20,
  },
  workoutButton: {
    backgroundColor: '#673ab7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  workoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
});