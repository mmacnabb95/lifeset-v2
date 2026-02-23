// useFeatureFlags Hook - Provides feature flag checks based on mode
import { useMode } from "./useMode";

export const useFeatureFlags = () => {
  const { hasFeature, organisation } = useMode();

  return {
    // Feature checks
    canBook: hasFeature("bookings"),
    canManageMemberships: hasFeature("memberships"),
    canBuyPacks: hasFeature("packs"),
    canCheckIn: hasFeature("qrCheckIn"),
    canUseHabits: hasFeature("habits"),
    canUseChallenges: hasFeature("challenges"),
    canUseJournal: hasFeature("journaling"),
    canUseNutrition: hasFeature("nutrition"),
    canUseWorkouts: hasFeature("workouts"),
    canViewAnalytics: hasFeature("analytics"),
    
    // Role checks (if organisation exists)
    isAdmin: organisation ? false : false, // TODO: Check user role from mode data
    isStaff: organisation ? false : false,
    isMember: organisation ? true : false,
    
    // Generic feature check
    hasFeature
  };
};

