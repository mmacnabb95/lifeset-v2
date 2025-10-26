import { useCallback } from 'react';
import { useFirebaseUser } from './useFirebaseUser';
import { getUserProfile, updateUserProfile } from '../services/firebase/user';
import moment from 'moment';

const XP_REWARDS = {
  CREATE_JOURNAL: 5,
  COMPLETE_WORKOUT: 10,
  COMPLETE_MEDITATION: 5,
  COMPLETE_HABIT: 10,
  COMPLETE_ALL_HABITS: 15,
} as const;

/**
 * Simplified XP rewards hook that saves directly to Firebase
 */
export const useXPRewards = () => {
  const { userId } = useFirebaseUser();

  const awardXP = useCallback(async (action: keyof typeof XP_REWARDS) => {
    if (!userId) {
      console.log('No userId, cannot award XP');
      return;
    }

    try {
      const amount = XP_REWARDS[action];
      console.log(`Awarding ${amount} XP for ${action}`);
      
      // Get current profile
      const profile = await getUserProfile(userId);
      if (!profile) {
        console.error('User profile not found');
        return;
      }

      const newXP = (profile.xp || 0) + amount;
      const newLevel = calculateLevel(newXP);

      // Update Firebase
      await updateUserProfile(userId, {
        xp: newXP,
        level: newLevel,
      });

      console.log(`XP updated: ${profile.xp} → ${newXP}, Level: ${newLevel}`);
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }, [userId]);

  const handleJournalCreation = useCallback(() => {
    awardXP('CREATE_JOURNAL');
  }, [awardXP]);

  const handleWorkoutCompletion = useCallback(() => {
    awardXP('COMPLETE_WORKOUT');
  }, [awardXP]);

  const handleMeditationCompletion = useCallback(() => {
    awardXP('COMPLETE_MEDITATION');
  }, [awardXP]);

  const handleHabitCompletion = useCallback(() => {
    awardXP('COMPLETE_HABIT');
  }, [awardXP]);

  const handleAllHabitsComplete = useCallback(() => {
    awardXP('COMPLETE_ALL_HABITS');
  }, [awardXP]);

  // Check if all habits completed and award bonus (once per day only)
  const checkAllHabitsCompleted = useCallback(async () => {
    if (!userId) return false;

    try {
      const today = moment().format('YYYY-MM-DD');
      const profile = await getUserProfile(userId);
      
      if (!profile) {
        console.log('No user profile found');
        return false;
      }

      // Check if bonus already awarded today
      if (profile.lastAllHabitsCompleteBonusDate === today) {
        console.log('All-habits bonus already awarded today');
        return false; // Don't show alert or award XP again
      }

      // Award the bonus XP
      await handleAllHabitsComplete();
      
      // Record that bonus was awarded today
      await updateUserProfile(userId, {
        lastAllHabitsCompleteBonusDate: today,
      });

      console.log('All-habits bonus awarded for', today);
      return true; // Show the success alert
    } catch (error) {
      console.error('Error checking all habits completed:', error);
      return false;
    }
  }, [userId, handleAllHabitsComplete]);

  return {
    handleJournalCreation,
    handleWorkoutCompletion,
    handleMeditationCompletion,
    handleHabitCompletion,
    handleAllHabitsComplete,
    checkAllHabitsCompleted,
  };
};

// Simple level calculation based on XP
function calculateLevel(xp: number): number {
  // Level 1: 0-99 XP
  // Level 2: 100-299 XP
  // Level 3: 300-599 XP
  // Level increases every 100 XP initially, scaling up
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

