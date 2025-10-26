import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { createWorkoutPlan, WorkoutPlan } from 'src/services/firebase/workout-plans';

export default function CreateWorkoutPlanScreen() {
  const navigation = useNavigation();
  const { userId } = useFirebaseUser();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [categories, setCategories] = useState<string[]>(['custom']); // Changed to array for multiple selection
  const [durationWeeks, setDurationWeeks] = useState('8');
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [saving, setSaving] = useState(false);

  const toggleCategory = (categoryKey: string) => {
    setCategories(prev => {
      if (prev.includes(categoryKey)) {
        // Remove if already selected (but keep at least one)
        return prev.length > 1 ? prev.filter(c => c !== categoryKey) : prev;
      } else {
        // Add to selection
        return [...prev, categoryKey];
      }
    });
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to create a workout plan');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const weeksNum = parseInt(durationWeeks);
    const daysNum = parseInt(daysPerWeek);

    if (isNaN(weeksNum) || weeksNum < 1 || weeksNum > 52) {
      Alert.alert('Error', 'Please enter a valid duration (1-52 weeks)');
      return;
    }

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 7) {
      Alert.alert('Error', 'Please enter valid days per week (1-7)');
      return;
    }

    try {
      setSaving(true);

      const newPlan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        description: description.trim(),
        difficulty,
        category: categories[0] || 'custom', // Use first selected category as primary
        durationWeeks: weeksNum,
        daysPerWeek: daysNum,
        isTemplate: false,
        createdBy: userId,
        userId,
        exercises: [], // Start with empty exercises, user can add them later
        tags: [difficulty, ...categories].filter(Boolean), // Include all selected categories in tags
      };

      const planId = await createWorkoutPlan(userId, newPlan);

      Alert.alert(
        'Success!',
        'Your workout plan has been created! Now add exercises to get started.',
        [
          {
            text: 'Add Exercises',
            onPress: () => {
              navigation.goBack(); // Go back to plans list
              // Navigate to edit screen with just the planId
              setTimeout(() => {
                navigation.navigate('EditWorkoutPlan' as never, { planId } as never);
              }, 100);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create workout plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Workout Plan</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Plan Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., My Custom Full Body Workout"
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your workout plan goals and structure..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Difficulty */}
          <View style={styles.field}>
            <Text style={styles.label}>Difficulty Level</Text>
            <View style={styles.optionsRow}>
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.option,
                    difficulty === level && styles.optionSelected,
                  ]}
                  onPress={() => setDifficulty(level as any)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      difficulty === level && styles.optionTextSelected,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category - Multi-Select */}
          <View style={styles.field}>
            <Text style={styles.label}>Categories (select one or more)</Text>
            <View style={styles.optionsRow}>
              {[
                { key: 'strength', label: '💪 Strength' },
                { key: 'cardio', label: '🏃 Cardio' },
                { key: 'flexibility', label: '🧘 Flexibility' },
                { key: 'custom', label: '✨ Custom' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.option,
                    categories.includes(cat.key) && styles.optionSelected,
                  ]}
                  onPress={() => toggleCategory(cat.key)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      categories.includes(cat.key) && styles.optionTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View style={styles.field}>
            <Text style={styles.label}>Duration (weeks)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 8"
              value={durationWeeks}
              onChangeText={setDurationWeeks}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.hint}>How many weeks will this program last?</Text>
          </View>

          {/* Days per week */}
          <View style={styles.field}>
            <Text style={styles.label}>Days per Week</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 3"
              value={daysPerWeek}
              onChangeText={setDaysPerWeek}
              keyboardType="number-pad"
              maxLength={1}
            />
            <Text style={styles.hint}>How many days per week will you workout?</Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Your custom workout plan will be created and saved. You can start following it right away or customize it later.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Creating...' : 'Create Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#26c6da',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionSelected: {
    backgroundColor: '#26c6da',
    borderColor: '#26c6da',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#26c6da',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

