import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { Button, ButtonTypes } from "src/components/common/button-simple";
import { createHabit } from "src/services/firebase/habits";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";

const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

export const AddHabitScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  
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
  const [loading, setLoading] = useState(false);

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
});
