import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { getWorkoutPlans, WorkoutPlan, getActiveWorkoutPlans, WorkoutPlanProgress, deleteWorkoutPlan } from 'src/services/firebase/workout-plans';
import workoutPlansData from '../../data/workout-plans.json';

const categories = [
  { key: 'all', label: 'All', emoji: '💪' },
  { key: 'strength', label: 'Strength', emoji: '🏋️' },
  { key: 'cardio', label: 'Cardio', emoji: '🏃' },
  { key: 'flexibility', label: 'Flexibility', emoji: '🧘' },
  { key: 'custom', label: 'Custom', emoji: '✨' },
];

const difficulties = [
  { key: 'all', label: 'All Levels' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
];

export function WorkoutPlansScreen() {
  const navigation = useNavigation();
  const { userId } = useFirebaseUser();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [activePlans, setActivePlans] = useState<(WorkoutPlanProgress & { plan: WorkoutPlan })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Load plans (local templates for now, can fetch from Firebase later)
  useFocusEffect(
    React.useCallback(() => {
      loadPlans();
    }, [userId])
  );

  const loadPlans = async () => {
    try {
      setLoading(true);
      
      // Load local template plans
      const localPlans = workoutPlansData as WorkoutPlan[];
      
      // Fetch user's custom plans from Firebase
      if (userId) {
        try {
          const firebasePlans = await getWorkoutPlans(userId);
          // Combine templates with custom plans
          setPlans([...localPlans, ...firebasePlans]);
          
          // Fetch active plans
          const activeData = await getActiveWorkoutPlans(userId);
          setActivePlans(activeData);
        } catch (error) {
          console.error('Error fetching Firebase plans:', error);
          // Fall back to just local plans
          setPlans(localPlans);
          setActivePlans([]);
        }
      } else {
        // User not logged in, show only templates
        setPlans(localPlans);
        setActivePlans([]);
      }
    } catch (error) {
      console.error('Error loading workout plans:', error);
      // Fall back to empty or local plans
      setPlans(workoutPlansData as WorkoutPlan[]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesCategory =
        selectedCategory === 'all' || plan.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'all' || plan.difficulty === selectedDifficulty;
      return matchesCategory && matchesDifficulty;
    });
  }, [plans, selectedCategory, selectedDifficulty]);

  const handlePlanPress = (plan: WorkoutPlan) => {
    navigation.navigate('WorkoutPlanDetail' as never, { plan } as never);
  };

  const handleCreatePlan = () => {
    navigation.navigate('CreateWorkoutPlan' as never);
  };

  const handleDeletePlan = async (plan: WorkoutPlan) => {
    if (!plan.id) return;
    
    Alert.alert(
      'Delete Workout Plan',
      `Are you sure you want to delete "${plan.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutPlan(plan.id!);
              // Reload plans to reflect deletion
              loadPlans();
              Alert.alert('Deleted', 'Workout plan deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete workout plan');
            }
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#673ab7" />
        <Text style={styles.loadingText}>Loading workout plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout Plans</Text>
        <Text style={styles.subtitle}>
          {filteredPlans.length} programs available
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Active Plans Section */}
        {activePlans.length > 0 && (
          <View style={styles.activeSection}>
            <View style={styles.activeSectionHeader}>
              <Text style={styles.activeSectionTitle}>🎯 My Active Plans</Text>
              <Text style={styles.activeSectionCount}>{activePlans.length}</Text>
            </View>
            
            {activePlans.map((progress) => {
              const percentComplete = Math.round(
                (progress.completedWorkouts / progress.totalWorkoutsPlanned) * 100
              );
              return (
                <TouchableOpacity
                  key={progress.id}
                  style={styles.activePlanCard}
                  onPress={() => handlePlanPress(progress.plan)}
                >
                  <View style={styles.activePlanHeader}>
                    <Text style={styles.activePlanName}>{progress.plan.name}</Text>
                    <Text style={styles.activePlanPercent}>{percentComplete}%</Text>
                  </View>
                  <View style={styles.activePlanProgressBar}>
                    <View 
                      style={[
                        styles.activePlanProgressFill, 
                        { width: `${percentComplete}%` }
                      ]} 
                    />
                  </View>
                  <View style={styles.activePlanStats}>
                    <Text style={styles.activePlanStatText}>
                      {progress.completedWorkouts} / {progress.totalWorkoutsPlanned} workouts
                    </Text>
                    <Text style={styles.activePlanStatDivider}>•</Text>
                    <Text style={styles.activePlanStatText}>
                      Week {Math.ceil(progress.completedWorkouts / progress.plan.daysPerWeek)} of {progress.plan.durationWeeks}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => handlePlanPress(progress.plan)}
                  >
                    <Text style={styles.continueButtonText}>Continue Program →</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Create Custom Plan Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePlan}
        >
          <Text style={styles.createButtonIcon}>+</Text>
          <View style={styles.createButtonContent}>
            <Text style={styles.createButtonTitle}>Create Custom Plan</Text>
            <Text style={styles.createButtonSubtitle}>
              Build your own workout routine
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Browse All Plans Divider */}
        <View style={styles.browseDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Browse All Plans</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.filterChip,
                  selectedCategory === cat.key && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={styles.filterEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === cat.key &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Difficulty Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff.key}
                style={[
                  styles.difficultyChip,
                  selectedDifficulty === diff.key &&
                    styles.difficultyChipActive,
                ]}
                onPress={() => setSelectedDifficulty(diff.key)}
              >
                <Text
                  style={[
                    styles.difficultyChipText,
                    selectedDifficulty === diff.key &&
                      styles.difficultyChipTextActive,
                  ]}
                >
                  {diff.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Workout Plans List */}
        <View style={styles.plansList}>
          {filteredPlans.map((plan, index) => (
            <View key={`${plan.id}-${index}`} style={styles.planCardWrapper}>
              <TouchableOpacity
                style={styles.planCard}
                onPress={() => handlePlanPress(plan)}
              >
              <View style={styles.planHeader}>
                <View style={styles.planTitleRow}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.isTemplate ? (
                    <View style={styles.templateBadge}>
                      <Text style={styles.templateBadgeText}>✨ LifeSet</Text>
                    </View>
                  ) : (
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>📝 My Plan</Text>
                    </View>
                  )}
                </View>
                
                {/* Delete button for custom plans */}
                {!plan.isTemplate && plan.userId === userId && (
                  <TouchableOpacity
                    style={styles.deleteButtonInline}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeletePlan(plan);
                    }}
                  >
                    <Text style={styles.deleteButtonInlineText}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <Text style={styles.planDescription} numberOfLines={2}>
                {plan.description}
              </Text>

              <View style={styles.planMeta}>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(plan.difficulty) },
                  ]}
                >
                  <Text style={styles.difficultyBadgeText}>
                    {plan.difficulty}
                  </Text>
                </View>
                <View style={styles.planStat}>
                  <Text style={styles.planStatText}>
                    📅 {plan.durationWeeks} weeks
                  </Text>
                </View>
                <View style={styles.planStat}>
                  <Text style={styles.planStatText}>
                    🗓️ {plan.daysPerWeek}x/week
                  </Text>
                </View>
                <View style={styles.planStat}>
                  <Text style={styles.planStatText}>
                    💪 {plan.exercises.length} exercises
                  </Text>
                </View>
              </View>

              <View style={styles.planTags}>
                {plan.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {plan.tags.length > 3 && (
                  <Text style={styles.moreTags}>+{plan.tags.length - 3}</Text>
                )}
              </View>
              </TouchableOpacity>
            </View>
          ))}

          {filteredPlans.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No workout plans found matching your filters
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  activeSection: {
    backgroundColor: '#e0f7fa',
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#26c6da',
  },
  activeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#26c6da',
  },
  activeSectionCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#26c6da',
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
  },
  activePlanCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#26c6da',
    shadowColor: '#26c6da',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activePlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  activePlanPercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#26c6da',
  },
  activePlanProgressBar: {
    height: 10,
    backgroundColor: '#b2ebf2',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  activePlanProgressFill: {
    height: '100%',
    backgroundColor: '#26c6da',
  },
  activePlanStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activePlanStatText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activePlanStatDivider: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 8,
  },
  continueButton: {
    backgroundColor: '#26c6da',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  browseDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
    paddingHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26c6da',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonIcon: {
    fontSize: 32,
    color: '#fff',
    marginRight: 12,
    fontWeight: 'bold',
  },
  createButtonContent: {
    flex: 1,
  },
  createButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  createButtonSubtitle: {
    fontSize: 14,
    color: '#b2ebf2',
  },
  chevron: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 8,
  },
  filterSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#26c6da',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  difficultyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  difficultyChipActive: {
    backgroundColor: '#26c6da',
    borderColor: '#26c6da',
  },
  difficultyChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  difficultyChipTextActive: {
    color: '#fff',
  },
  plansList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  planCardWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
  },
  templateBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  templateBadgeText: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: '600',
  },
  customBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  customBadgeText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  planMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  planStat: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planStatText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  planTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
  moreTags: {
    fontSize: 11,
    color: '#999',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#26c6da',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonInline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonInlineText: {
    fontSize: 18,
  },
});

