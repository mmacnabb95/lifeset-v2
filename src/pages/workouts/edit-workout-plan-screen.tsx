import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { getWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan, WorkoutPlan, WorkoutPlanExercise } from 'src/services/firebase/workout-plans';
import exercisesData from '../../data/exercises.json';

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

export default function EditWorkoutPlanScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = useFirebaseUser();
  const { planId } = route.params as { planId: string };
  
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDay, setSelectedDay] = useState<string>('Day 1');
  const [showDayModal, setShowDayModal] = useState(false);
  const [editingDayForExercise, setEditingDayForExercise] = useState<number | null>(null);

  const exercises = exercisesData as Exercise[];

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const fetchedPlan = await getWorkoutPlan(planId);
      if (fetchedPlan) {
        setPlan(fetchedPlan);
      } else {
        Alert.alert('Error', 'Workout plan not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading plan:', error);
      Alert.alert('Error', 'Failed to load workout plan');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exerciseId: number) => {
    if (!plan) return;

    // Find exercise details to check if it's cardio
    const exerciseDetails = exercises.find(ex => ex.id === exerciseId);
    const isCardio = exerciseDetails?.category === 'cardio';

    const newExercise: WorkoutPlanExercise = {
      exerciseId,
      ...(isCardio 
        ? { durationSeconds: 1800 } // Default 30 minutes for cardio
        : { sets: 3, reps: 10 }      // Default sets/reps for strength
      ),
      restSeconds: isCardio ? 0 : 60, // No rest for cardio
      order: plan.exercises.length + 1,
      note: selectedDay, // Add the day/split info
    };

    setPlan({
      ...plan,
      exercises: [...plan.exercises, newExercise],
    });

    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (index: number) => {
    if (!plan) return;

    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newExercises = plan.exercises.filter((_, i) => i !== index);
            // Reorder remaining exercises
            const reorderedExercises = newExercises.map((ex, i) => ({
              ...ex,
              order: i + 1,
            }));
            setPlan({ ...plan, exercises: reorderedExercises });
          },
        },
      ]
    );
  };

  const handleUpdateExercise = (index: number, updates: Partial<WorkoutPlanExercise>) => {
    if (!plan) return;

    const updatedExercises = [...plan.exercises];
    updatedExercises[index] = { ...updatedExercises[index], ...updates };
    setPlan({ ...plan, exercises: updatedExercises });
  };

  const handleSave = async () => {
    if (!plan) return;

    try {
      setSaving(true);
      await updateWorkoutPlan(planId, {
        exercises: plan.exercises,
      });
      Alert.alert('Success!', 'Workout plan updated', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save workout plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this workout plan? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutPlan(planId);
              Alert.alert('Deleted', 'Workout plan deleted', [
                { text: 'OK', onPress: () => navigation.navigate('WorkoutPlans' as never) },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete plan');
            }
          },
        },
      ]
    );
  };

  const categories = [
    { key: 'all', label: 'All', emoji: '💪' },
    { key: 'chest', label: 'Chest', emoji: '🦾' },
    { key: 'back', label: 'Back', emoji: '🔙' },
    { key: 'shoulders', label: 'Shoulders', emoji: '💪' },
    { key: 'legs', label: 'Legs', emoji: '🦵' },
    { key: 'biceps', label: 'Biceps', emoji: '💪' },
    { key: 'triceps', label: 'Triceps', emoji: '💪' },
    { key: 'abs', label: 'Abs', emoji: '🔥' },
    { key: 'glutes', label: 'Glutes', emoji: '🍑' },
    { key: 'cardio', label: 'Cardio', emoji: '🏃' },
    { key: 'stretching', label: 'Stretch', emoji: '🧘' },
  ];

  // Get all unique days/splits from the plan
  const getDays = () => {
    if (!plan) return ['Day 1'];
    const days = new Set(plan.exercises.map(ex => ex.note || 'Day 1'));
    return Array.from(days).sort();
  };

  // Get exercises for the selected day
  const getExercisesForDay = (day: string) => {
    if (!plan) return [];
    return plan.exercises.filter(ex => (ex.note || 'Day 1') === day);
  };

  const filteredExercises = exercises.filter(
    (ex) => selectedCategory === 'all' || ex.category === selectedCategory
  );

  if (loading || !plan) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Plan</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Plan Info */}
        <View style={styles.section}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
          <View style={styles.planMeta}>
            <Text style={styles.planMetaText}>
              {plan.durationWeeks} weeks • {plan.daysPerWeek}x/week
            </Text>
          </View>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySelectorScroll}
          >
            {getDays().map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  selectedDay === day && styles.dayChipActive,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    selectedDay === day && styles.dayChipTextActive,
                  ]}
                >
                  {day}
                </Text>
                <Text style={styles.dayChipCount}>
                  ({getExercisesForDay(day).length})
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addDayChip}
              onPress={() => setShowDayModal(true)}
            >
              <Text style={styles.addDayChipText}>+ Add Day</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Exercises List for Selected Day */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedDay} Exercises ({getExercisesForDay(selectedDay).length})
            </Text>
          </View>

          {getExercisesForDay(selectedDay).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No exercises for {selectedDay} yet. Tap "Add Exercise" to get started!
              </Text>
            </View>
          )}

          {plan.exercises.map((planEx, index) => {
            // Only show exercises for the selected day
            if ((planEx.note || 'Day 1') !== selectedDay) return null;
            const exerciseDetails = exercises.find((ex) => ex.id === planEx.exerciseId);
            if (!exerciseDetails) return null;

            return (
              <View key={index} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.exerciseName}>{exerciseDetails.name}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveExercise(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.exerciseInputs}>
                  {exerciseDetails.category === 'cardio' ? (
                    // Duration input for cardio
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Duration (min)</Text>
                      <TextInput
                        style={styles.input}
                        value={String(Math.floor((planEx.durationSeconds || 0) / 60))}
                        onChangeText={(text) => {
                          if (text === '') {
                            handleUpdateExercise(index, { durationSeconds: 0 });
                            return;
                          }
                          const minutes = parseInt(text);
                          if (!isNaN(minutes) && minutes >= 0) {
                            handleUpdateExercise(index, { durationSeconds: minutes * 60 });
                          }
                        }}
                        keyboardType="number-pad"
                        maxLength={3}
                        selectTextOnFocus={true}
                      />
                    </View>
                  ) : (
                    // Sets and Reps for strength exercises
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Sets</Text>
                        <TextInput
                          style={styles.input}
                          value={String(planEx.sets || 0)}
                          onChangeText={(text) => {
                            if (text === '') {
                              handleUpdateExercise(index, { sets: 1 });
                              return;
                            }
                            const num = parseInt(text);
                            if (!isNaN(num) && num > 0) {
                              handleUpdateExercise(index, { sets: num });
                            }
                          }}
                          keyboardType="number-pad"
                          maxLength={2}
                          selectTextOnFocus={true}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Reps</Text>
                        <TextInput
                          style={styles.input}
                          value={String(planEx.reps || 0)}
                          onChangeText={(text) => {
                            if (text === '') {
                              handleUpdateExercise(index, { reps: 1 });
                              return;
                            }
                            const num = parseInt(text);
                            if (!isNaN(num) && num > 0) {
                              handleUpdateExercise(index, { reps: num });
                            }
                          }}
                          keyboardType="number-pad"
                          maxLength={3}
                          selectTextOnFocus={true}
                        />
                      </View>
                    </>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Rest (s)</Text>
                    <TextInput
                      style={styles.input}
                      value={String(planEx.restSeconds)}
                      onChangeText={(text) => {
                        // Allow empty string while typing
                        if (text === '') {
                          handleUpdateExercise(index, { restSeconds: 0 });
                          return;
                        }
                        const num = parseInt(text);
                        if (!isNaN(num) && num >= 0) {
                          handleUpdateExercise(index, { restSeconds: num });
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={3}
                      selectTextOnFocus={true}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowExercisePicker(true)}
        >
          <Text style={styles.addButtonText}>+ Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        onRequestClose={() => setShowExercisePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
              <Text style={styles.modalCloseText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.key && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.key && styles.categoryLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercise List */}
          <ScrollView style={styles.exerciseList}>
            {filteredExercises.map((exercise) => {
              const alreadyAdded = plan.exercises.some(
                (ex) => ex.exerciseId === exercise.id
              );
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exercisePickerCard,
                    alreadyAdded && styles.exercisePickerCardDisabled,
                  ]}
                  onPress={() => !alreadyAdded && handleAddExercise(exercise.id)}
                  disabled={alreadyAdded}
                >
                  <Text style={styles.exercisePickerName}>{exercise.name}</Text>
                  <Text style={styles.exercisePickerCategory}>
                    {exercise.category}
                  </Text>
                  {alreadyAdded && (
                    <Text style={styles.alreadyAddedText}>✓ Added</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Add/Rename Day Modal */}
      <Modal
        visible={showDayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dayModalContent}>
            <Text style={styles.dayModalTitle}>Add New Day/Split</Text>
            <Text style={styles.dayModalSubtitle}>
              Choose a name for this workout day
            </Text>
            
            <View style={styles.dayOptions}>
              {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={styles.dayOption}
                  onPress={() => {
                    setSelectedDay(day);
                    setShowDayModal(false);
                  }}
                >
                  <Text style={styles.dayOptionText}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.daySplitOptions}>
              <Text style={styles.splitOptionsTitle}>Or use a split name:</Text>
              {['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body', 'Full Body', 'Cardio Day', 'Rest Day'].map((split) => (
                <TouchableOpacity
                  key={split}
                  style={styles.dayOption}
                  onPress={() => {
                    setSelectedDay(split);
                    setShowDayModal(false);
                  }}
                >
                  <Text style={styles.dayOptionText}>{split}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.dayModalCancel}
              onPress={() => setShowDayModal(false)}
            >
              <Text style={styles.dayModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#26c6da',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  planMeta: {
    flexDirection: 'row',
  },
  planMetaText: {
    fontSize: 14,
    color: '#999',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  exerciseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#c62828',
    fontWeight: 'bold',
  },
  exerciseInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlign: 'center',
    fontWeight: '600',
  },
  addButton: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#26c6da',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#26c6da',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#26c6da',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  categoryScroll: {
    maxHeight: 80,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#26c6da',
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    flexShrink: 0,
  },
  categoryLabelActive: {
    color: '#fff',
  },
  exerciseList: {
    flex: 1,
    padding: 16,
  },
  exercisePickerCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exercisePickerCardDisabled: {
    opacity: 0.5,
  },
  exercisePickerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exercisePickerCategory: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  alreadyAddedText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
    marginTop: 4,
  },
  daySelector: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  daySelectorScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  dayChipActive: {
    backgroundColor: '#26c6da',
    borderColor: '#26c6da',
  },
  dayChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginRight: 6,
  },
  dayChipTextActive: {
    color: '#fff',
  },
  dayChipCount: {
    fontSize: 12,
    color: '#999',
  },
  addDayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4caf50',
    borderStyle: 'dashed',
  },
  addDayChipText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dayModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  dayModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dayModalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  dayOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  dayOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  dayOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  daySplitOptions: {
    marginBottom: 24,
  },
  splitOptionsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  dayModalCancel: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 16,
  },
  dayModalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

