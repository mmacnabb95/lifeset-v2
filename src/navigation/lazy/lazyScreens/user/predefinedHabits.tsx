import React, { lazy } from 'react';

// Fix this line:
// const LazyPredefinedHabitsScreen = lazy(import('src/pages/user/predefinedHabits/predefinedHabits'));
// To:
const LazyPredefinedHabitsScreen = lazy(() => import('src/pages/user/predefinedHabits/predefinedHabits'));

export default function LazyPredefinedHabits(props) {
  return (
    <React.Suspense fallback={null}>
      <LazyPredefinedHabitsScreen {...props} />
    </React.Suspense>
  );
} 