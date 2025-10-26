import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { UserWorkoutDay } from '../pages/workouts/UserWorkoutDay';
import { UserWorkoutAssignment } from '../pages/workouts/UserWorkoutAssignment';
import { HomeScreen } from '../pages/home/HomeScreen';

// Import your existing screens
// ... other imports

const Stack = createStackNavigator();

export const MainStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home"> {/* Make sure you have an initial route */}
      {/* Your existing home/main screen */}
      <Stack.Screen 
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
        }}
      />

      {/* Your other existing screens */}
      
      {/* Workout screens */}
      <Stack.Screen
        name="UserWorkoutDay"
        component={UserWorkoutDay}
        options={{
          title: 'Workout',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="UserWorkoutAssignment"
        component={UserWorkoutAssignment}
        options={{
          title: 'Get Personalized Workout',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}; 