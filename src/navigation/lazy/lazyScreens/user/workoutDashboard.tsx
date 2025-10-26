import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

const WorkoutDashboard = lazy(() => 
  import('../../../../pages/workouts/WorkoutDashboard').then(module => ({
    default: module.default
  }))
);

export const LazyWorkoutDashboardScreen = (props: any) => {
  return (
    <Suspense 
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <WorkoutDashboard {...props} />
    </Suspense>
  );
}; 