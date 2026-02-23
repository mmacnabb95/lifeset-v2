import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Button, ButtonTypes } from "src/components/common/button-simple";
import { createHabit, getOrganisationHabits } from "src/services/firebase/habits";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { useMode } from "src/hooks/useMode";
import { getGoals, Goal, linkHabitToGoals } from "src/services/firebase/goals";

const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

interface OrgHabit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  streakTarget?: number;
  schedule: Record<string, boolean>;
}

export const AddHabitScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  const { organisation } = useMode();
  
  const [orgHabits, setOrgHabits] = useState<OrgHabit[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [schedule, setSchedule] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGoals = async () => {
      if (!userId) return;
      try {
        setLoadingGoals(true);
        const goalsData = await getGoals(userId);
        setGoals(goalsData);
      } catch (error) {
        console.error('Error loading goals:', error);
      } finally {
        setLoadingGoals(false);
      }
    };
    loadGoals();
  }, [userId]);

  useEffect(() => {
    if (!organisation?.organisationId) return;
    getOrganisationHabits(organisation.organisationId).then(setOrgHabits);
  }, [organisation?.organisationId]);

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: !prev[day as keyof typeof prev],
    }));
  };

  const selectAllDays = () => {
    setSchedule({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    });
  };

  const selectWeekdays = () => {
    setSchedule({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    });
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleCreateHabit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Check if at least one day is selected
    const hasSelectedDay = Object.values(schedule).some(v => v);
    if (!hasSelectedDay) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    try {
      setLoading(true);
      
      // Build habit object, only including optional fields if they have values
      const habitData: any = {
        userId: userId,
        name: name.trim(),
        schedule,
      };
      
      // Only add description if it has a value
      if (description.trim()) {
        habitData.description = description.trim();
      }
      
      // Only add category if it has a value
      if (category.trim()) {
        habitData.category = category.trim();
      }
      
      const habitId = await createHabit(habitData);

      // Link habit to selected goals
      if (selectedGoals.size > 0 && userId) {
        try {
          await linkHabitToGoals(userId, habitId, Array.from(selectedGoals), true); // Recalculate progress
        } catch (error) {
          console.error('Error linking habit to goals:', error);
          // Don't fail the habit creation if goal linking fails
        }
      }

      console.log('Created habit:', habitId);
      Alert.alert('Success', 'Habit created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      console.error('Error creating habit:', err);
      Alert.alert('Error', err.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Habit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Studio suggestions */}
        {orgHabits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Suggested by your studio</Text>
            <Text style={styles.sublabel}>Tap to use as a starting point</Text>
            <View style={styles.suggestionChips}>
              {orgHabits.map((h) => (
                <TouchableOpacity
                  key={h.id}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setName(h.name);
                    setDescription(h.description || '');
                    setCategory(h.category || '');
                    setSchedule(h.schedule || {
                      monday: true, tuesday: true, wednesday: true, thursday: true,
                      friday: true, saturday: true, sunday: true,
                    });
                  }}
                >
                  <Text style={styles.suggestionChipText}>{h.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Habit Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Habit Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Morning Meditation"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., 10 minutes of mindfulness practice"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Health, Productivity, Fitness"
            value={category}
            onChangeText={setCategory}
            maxLength={30}
          />
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.label}>Schedule *</Text>
          <Text style={styles.sublabel}>Select the days you want to do this habit</Text>
          
          {/* Quick select buttons */}
          <View style={styles.quickSelect}>
            <TouchableOpacity style={styles.quickSelectButton} onPress={selectAllDays}>
              <Text style={styles.quickSelectText}>All Days</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickSelectButton} onPress={selectWeekdays}>
              <Text style={styles.quickSelectText}>Weekdays</Text>
            </TouchableOpacity>
          </View>

          {/* Days selector */}
          <View style={styles.daysContainer}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  schedule[day.key as keyof typeof schedule] && styles.dayButtonSelected,
                ]}
                onPress={() => toggleDay(day.key)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    schedule[day.key as keyof typeof schedule] && styles.dayButtonTextSelected,
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Link to Goals */}
        {goals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Link to Goals (Optional)</Text>
            <Text style={styles.sublabel}>
              Select goals this habit contributes to
            </Text>
            
            {loadingGoals ? (
              <ActivityIndicator size="small" color="#007AFF" style={{ marginTop: 10 }} />
            ) : (
              <View style={styles.goalsList}>
                {goals.map((goal) => {
                  const isSelected = selectedGoals.has(goal.id!);
                  return (
                    <TouchableOpacity
                      key={goal.id}
                      style={[styles.goalOption, isSelected && styles.goalOptionSelected]}
                      onPress={() => toggleGoal(goal.id!)}
                    >
                      <View style={[styles.goalCheckbox, isSelected && styles.goalCheckboxSelected]}>
                        {isSelected && <Text style={styles.goalCheckmark}>✓</Text>}
                      </View>
                      <View style={styles.goalInfo}>
                        <Text style={[styles.goalOptionText, isSelected && styles.goalOptionTextSelected]}>
                          {goal.title}
                        </Text>
                        {goal.description && (
                          <Text style={styles.goalDescription} numberOfLines={1}>
                            {goal.description}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Create Button */}
        <Button
          type={ButtonTypes.Primary}
          title={loading ? "Creating..." : "Create Habit"}
          onPress={handleCreateHabit}
          disabled={loading}
          style={styles.createButton}
        />

        {/* Help Text */}
        <View style={styles.helpText}>
          <Text style={styles.helpTextContent}>
            💡 Tip: Start with small, achievable habits. You can always add more later!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  quickSelect: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  quickSelectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  quickSelectText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextSelected: {
    color: 'white',
  },
  createButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  helpText: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  helpTextContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  goalsList: {
    marginTop: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  goalOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  goalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  goalCheckboxSelected: {
    backgroundColor: '#007AFF',
  },
  goalCheckmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalInfo: {
    flex: 1,
  },
  goalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  goalOptionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  goalDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  suggestionChipText: {
    fontSize: 14,
    color: '#1565c0',
    fontWeight: '500',
  },
});
