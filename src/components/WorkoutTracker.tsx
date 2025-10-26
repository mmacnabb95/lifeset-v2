import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useXP } from '../useXP';

interface WorkoutTrackerProps {
  onComplete: () => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const { awardXP } = useXP();

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      awardXP('COMPLETE_WORKOUT');
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Workout</Text>
      <Button
        title={isCompleted ? "Workout Completed!" : "Complete Workout"}
        onPress={handleComplete}
        disabled={isCompleted}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default WorkoutTracker; 