import React from 'react';
import { GuidedOnboarding } from 'src/pages/onboarding/GuidedOnboarding';

export const AddGoalScreen = ({ navigation }: { navigation: any }) => {
  return (
    <GuidedOnboarding
      mode="add-goal"
      onComplete={() => navigation.goBack()}
      onSkip={() => navigation.goBack()}
    />
  );
};
