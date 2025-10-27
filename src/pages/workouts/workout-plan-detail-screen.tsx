import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { WorkoutPlan, startWorkoutPlan, duplicateWorkoutPlan, getActiveWorkoutPlans, completeWorkoutSession, WorkoutPlanProgress, deleteWorkoutPlan } from 'src/services/firebase/workout-plans';
import { useXPRewards } from 'src/hooks/useXPRewards';
import exercisesData from '../../data/exercises.json';
import { db } from 'src/services/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

interface Exercise {
  id: number;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  equipment: string[];
  muscleGroups: string[];
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
}

export default function WorkoutPlanDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = useFirebaseUser();
  const { handleWorkoutCompletion } = useXPRewards();
  const { plan } = route.params as { plan: WorkoutPlan };
  const [starting, setStarting] = useState(false);
  const [activeProgress, setActiveProgress] = useState<(WorkoutPlanProgress & { plan: WorkoutPlan }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const exercises = exercisesData as Exercise[];

  // Check if this plan is active
  useEffect(() => {
    const checkIfActive = async () => {
      if (!userId || !plan.id) {
        setLoading(false);
        return;
      }
      
      try {
        const activePlans = await getActiveWorkoutPlans(userId);
        const thisProgress = activePlans.find(p => p.workoutPlanId === plan.id);
        setActiveProgress(thisProgress || null);
      } catch (error) {
        console.error('Error checking plan status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkIfActive();
  }, [userId, plan.id]);

  // Get exercise details for each exercise in the plan
  const planExercises = plan.exercises
    .sort((a, b) => a.order - b.order)
    .map((planExercise) => {
      const exerciseDetails = exercises.find((ex) => ex.id === planExercise.exerciseId);
      return {
        ...planExercise,
        exerciseDetails,
      };
    });

  const handleStartPlan = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'Please login to start a workout plan');
      return;
    }

    Alert.alert(
      'Start Workout Plan',
      `Are you ready to start "${plan.name}"? This will track your progress over ${plan.durationWeeks} weeks.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              setStarting(true);
              // Pass the full plan object (works for both templates and Firestore plans)
              await startWorkoutPlan(userId, plan);
              Alert.alert(
                'Success!',
                'Workout plan started! You can track your progress from the home screen.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to start workout plan');
            } finally {
              setStarting(false);
            }
          },
        },
      ]
    );
  };

  const handleCustomise = async () => {
    if (!userId) {
      Alert.alert('Login Required', 'Please login to customise workout plans');
      return;
    }

    Alert.alert(
      'Customise Plan',
      'Create a custom copy of this plan that you can modify?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Copy',
          onPress: async () => {
            try {
              // Pass the plan object directly for local templates
              const newPlanId = await duplicateWorkoutPlan(userId, plan.id!, plan);
              Alert.alert(
                'Success!',
                'Custom plan created! You can now edit it.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('EditWorkoutPlan' as never, { planId: newPlanId } as never),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to customise plan');
            }
          },
        },
      ]
    );
  };

  const handleCompleteWorkout = async () => {
    if (!activeProgress) return;

    Alert.alert(
      'Complete Workout',
      'Mark today\'s workout as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setCompleting(true);
              await completeWorkoutSession(activeProgress.id!);
              
              // Award XP for workout
              handleWorkoutCompletion();
              
              // Refresh progress
              const activePlans = await getActiveWorkoutPlans(userId!);
              const updatedProgress = activePlans.find(p => p.workoutPlanId === plan.id);
              setActiveProgress(updatedProgress || null);
              
              const newCount = (activeProgress.completedWorkouts || 0) + 1;
              const isComplete = newCount >= activeProgress.totalWorkoutsPlanned;
              
              if (isComplete) {
                Alert.alert(
                  '🎉 Program Complete!',
                  `Congratulations! You've completed "${plan.name}"!\n\n+10 XP earned! 🌟`,
                  [{ 
                    text: 'Awesome!', 
                    onPress: () => {
                      // Navigate back to home, clearing the stack
                      navigation.navigate('Home' as never);
                    }
                  }]
                );
              } else {
                Alert.alert(
                  '✓ Workout Complete!',
                  `Great job! ${newCount} / ${activeProgress.totalWorkoutsPlanned} workouts done.\n\n+10 XP earned! 🌟`,
                  [{ 
                    text: 'Done', 
                    onPress: () => {
                      // Navigate back to home, clearing the stack
                      navigation.navigate('Home' as never);
                    }
                  }]
                );
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to complete workout');
            } finally {
              setCompleting(false);
            }
          },
        },
      ]
    );
  };

  const handleStopPlan = () => {
    if (!activeProgress) return;

    Alert.alert(
      'Stop Program',
      `Are you sure you want to stop "${plan.name}"? Your progress will be saved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Program',
          style: 'destructive',
          onPress: async () => {
            try {
              const progressRef = doc(db, 'users', userId!, 'workout_progress', activeProgress.id!);
              await updateDoc(progressRef, {
                isActive: false,
              });
              
              // Refresh to update UI
              const activePlans = await getActiveWorkoutPlans(userId!);
              const updatedProgress = activePlans.find(p => p.workoutPlanId === plan.id);
              setActiveProgress(updatedProgress || null);
              
              Alert.alert('Stopped', 'Program stopped. You can restart it anytime!', [
                { text: 'OK', onPress: () => navigation.navigate('WorkoutPlans' as never) },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to stop program');
            }
          },
        },
      ]
    );
  };

  const handleDeletePlan = () => {
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
              Alert.alert('Deleted', 'Workout plan deleted successfully', [
                { text: 'OK', onPress: () => navigation.navigate('WorkoutPlans' as never) },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete workout plan');
            }
          },
        },
      ]
    );
  };

  const handleExercisePress = (exercise: Exercise) => {
    navigation.navigate('ExerciseDetail' as never, { exercise } as never);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  // Group exercises by day (extract day name from note)
  const groupedExercises = planExercises.reduce((acc, ex) => {
    // Extract day name from note (e.g., "Push Day - Exercise Name" -> "Push Day")
    let dayName = 'Main Workout';
    if (ex.note) {
      // Check if note contains common day patterns
      if (ex.note.includes('Push Day')) {
        dayName = 'Push Day';
      } else if (ex.note.includes('Pull Day')) {
        dayName = 'Pull Day';
      } else if (ex.note.includes('Leg Day')) {
        dayName = 'Leg Day';
      } else if (ex.note.includes('Upper Day')) {
        dayName = 'Upper Day';
      } else if (ex.note.includes('Lower Day')) {
        dayName = 'Lower Day';
      } else if (ex.note.match(/Day \d+/)) {
        // Match "Day 1", "Day 2", etc.
        const match = ex.note.match(/(Day \d+)/);
        dayName = match ? match[1] : ex.note;
      } else {
        // Use the note as-is if it doesn't match patterns above
        dayName = ex.note.split(' - ')[0]; // Take first part before dash
      }
    }
    
    if (!acc[dayName]) {
      acc[dayName] = [];
    }
    acc[dayName].push(ex);
    return acc;
  }, {} as Record<string, typeof planExercises>);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{plan.name}</Text>
            {plan.isTemplate ? (
              <View style={styles.templateBadge}>
                <Text style={styles.templateBadgeText}>✨ LifeSet Program</Text>
              </View>
            ) : (
              <View style={styles.customBadgeDetail}>
                <Text style={styles.customBadgeDetailText}>📝 My Plan</Text>
              </View>
            )}
          </View>
          
          {/* Delete button for custom plans */}
          {!plan.isTemplate && plan.userId === userId && (
            <TouchableOpacity
              style={styles.headerDeleteButton}
              onPress={handleDeletePlan}
            >
              <Text style={styles.headerDeleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(plan.difficulty) },
            ]}
          >
            <Text style={styles.difficultyBadgeText}>{plan.difficulty}</Text>
          </View>
          <View style={styles.metaStat}>
            <Text style={styles.metaStatText}>📅 {plan.durationWeeks} weeks</Text>
          </View>
          <View style={styles.metaStat}>
            <Text style={styles.metaStatText}>🗓️ {plan.daysPerWeek}x/week</Text>
          </View>
          <View style={styles.metaStat}>
            <Text style={styles.metaStatText}>
              💪 {plan.exercises.length} exercises
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>{plan.description}</Text>
        </View>

        {/* Active Progress */}
        {activeProgress && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>📊 Your Progress</Text>
              <Text style={styles.progressPercent}>
                {Math.round((activeProgress.completedWorkouts / activeProgress.totalWorkoutsPlanned) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(activeProgress.completedWorkouts / activeProgress.totalWorkoutsPlanned) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {activeProgress.completedWorkouts} / {activeProgress.totalWorkoutsPlanned} workouts completed • Week {Math.ceil(activeProgress.completedWorkouts / plan.daysPerWeek)} of {plan.durationWeeks}
            </Text>
          </View>
        )}

        {/* Total Workouts */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {plan.daysPerWeek * plan.durationWeeks}
            </Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{plan.daysPerWeek}</Text>
            <Text style={styles.statLabel}>Per Week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{plan.durationWeeks}</Text>
            <Text style={styles.statLabel}>Weeks</Text>
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {Object.entries(groupedExercises).map(([groupName, exercises]) => (
            <View key={groupName} style={styles.exerciseGroup}>
              {/* Day/Split Header - Always show if there are groups */}
              {groupName !== 'Main Workout' && (
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>{groupName}</Text>
                </View>
              )}
              
              {exercises.map((planEx, index) => {
                if (!planEx.exerciseDetails) {
                  return (
                    <View key={index} style={styles.exerciseCard}>
                      <Text style={styles.exerciseName}>
                        Exercise ID {planEx.exerciseId} (not found)
                      </Text>
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.exerciseCard}
                    onPress={() => handleExercisePress(planEx.exerciseDetails!)}
                  >
                    <View style={styles.exerciseNumber}>
                      <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.exerciseContent}>
                      <Text style={styles.exerciseName}>
                        {planEx.exerciseDetails.name}
                      </Text>
                      <View style={styles.exerciseDetails}>
                        <Text style={styles.exerciseDetailText}>
                          {planEx.exerciseDetails.category === 'cardio' || planEx.durationSeconds
                            ? `${Math.floor((planEx.durationSeconds || 0) / 60)}:${String((planEx.durationSeconds || 0) % 60).padStart(2, '0')} min`
                            : `${planEx.sets || 0} sets × ${planEx.reps || 0} reps`}
                        </Text>
                        {planEx.restSeconds > 0 && (
                          <>
                            <Text style={styles.exerciseDetailDivider}>•</Text>
                            <Text style={styles.exerciseDetailText}>
                              {planEx.restSeconds}s rest
                            </Text>
                          </>
                        )}
                        {planEx.weight && (
                          <>
                            <Text style={styles.exerciseDetailDivider}>•</Text>
                            <Text style={styles.exerciseDetailText}>
                              {planEx.weight} lbs
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Tags */}
        {plan.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {plan.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {activeProgress ? (
          // Plan is active - show complete button + stop button
          <>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteWorkout}
              disabled={completing}
            >
              <Text style={styles.completeButtonText}>
                {completing ? 'Completing...' : '✓ Complete Workout'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopPlan}
            >
              <Text style={styles.stopButtonText}>⏹ Stop</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Plan not active - show customize/edit + start buttons
          <>
            {plan.isTemplate ? (
              <TouchableOpacity
                style={styles.customizeButton}
                onPress={handleCustomise}
              >
                <Text style={styles.customizeButtonText}>✏️ Customise</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.customizeButton}
                onPress={() => navigation.navigate('EditWorkoutPlan' as never, { planId: plan.id } as never)}
              >
                <Text style={styles.customizeButtonText}>✏️ Edit Plan</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartPlan}
              disabled={starting}
            >
              <Text style={styles.startButtonText}>
                {starting ? 'Starting...' : '🚀 Start Plan'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  templateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  templateBadgeText: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: '600',
  },
  customBadgeDetail: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  customBadgeDetailText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  headerDeleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerDeleteButtonText: {
    fontSize: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaStat: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  metaStatText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#26c6da',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  exerciseGroup: {
    marginBottom: 16,
  },
  groupHeader: {
    backgroundColor: '#26c6da',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    marginTop: 8,
    shadowColor: '#26c6da',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#26c6da',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseDetailText: {
    fontSize: 13,
    color: '#666',
  },
  exerciseDetailDivider: {
    fontSize: 13,
    color: '#ccc',
    marginHorizontal: 6,
  },
  chevron: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  customizeButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  customizeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    flex: 1,
    backgroundColor: '#26c6da',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonHalf: {
    flex: 1,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 3,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#ff5252',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#f3e5f5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#26c6da',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#26c6da',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e1bee7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#26c6da',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
});

