import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useXP } from "../useXP";

interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

interface HabitTrackerProps {
  habits: Habit[];
  onHabitComplete: (habitId: string) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  onHabitComplete,
}) => {
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(
    new Set(),
  );
  const { awardXP } = useXP();

  const handleHabitToggle = (habitId: string) => {
    if (!completedHabits.has(habitId)) {
      const newCompletedHabits = new Set(completedHabits);
      newCompletedHabits.add(habitId);
      setCompletedHabits(newCompletedHabits);

      awardXP("COMPLETE_HABIT");
      onHabitComplete(habitId);

      // Check if all habits are completed
      if (newCompletedHabits.size === habits.length) {
        awardXP("COMPLETE_ALL_HABITS");
      }
    }
  };

  return (
    <View style={styles.container}>
      {habits.map((habit) => (
        <TouchableOpacity
          key={habit.id}
          style={[
            styles.habitItem,
            completedHabits.has(habit.id) && styles.completedHabit,
          ]}
          onPress={() => handleHabitToggle(habit.id)}
          disabled={completedHabits.has(habit.id)}
        >
          <Text style={styles.habitName}>{habit.name}</Text>
          {completedHabits.has(habit.id) && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  completedHabit: {
    backgroundColor: "#e8f5e9",
    borderColor: "#81c784",
  },
  habitName: {
    fontSize: 16,
    flex: 1,
  },
  checkmark: {
    color: "#4caf50",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default HabitTracker;
