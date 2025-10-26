import { useCallback } from 'react';
import { useXP } from './useXP';
import { useSelector } from 'react-redux';
import { habitsSelector } from './redux/domain/features/habit/collection-slice';
import { useUserInfo } from './redux/features/userInfo/useUserInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useXPRewards = () => {
  const { awardXP } = useXP();
  const { userId } = useUserInfo();
  const habits = useSelector(habitsSelector(userId));

  const handleJournalCreation = useCallback(() => {
    awardXP('CREATE_JOURNAL');
  }, [awardXP]);

  const handleWorkoutCompletion = useCallback(() => {
    awardXP('COMPLETE_WORKOUT');
  }, [awardXP]);

  const handleMeditationCompletion = useCallback(() => {
    awardXP('COMPLETE_MEDITATION');
  }, [awardXP]);

  const checkAllHabitsCompleted = useCallback(async () => {
    if (!habits) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const todaysHabits = habits.filter(h => h.Date === today);
    const allCompleted = todaysHabits.length > 0 && todaysHabits.every(h => h.CompletedToday);
    
    if (allCompleted) {
      // Check if we already awarded XP today
      const key = `habits_xp_${userId}_${today}`;
      const awarded = await AsyncStorage.getItem(key);
      
      if (!awarded) {
        awardXP('COMPLETE_ALL_HABITS');
        await AsyncStorage.setItem(key, 'true');
        return true;
      }
    }
    return false;
  }, [habits, userId, awardXP]);

  return {
    handleJournalCreation,
    handleWorkoutCompletion,
    handleMeditationCompletion,
    checkAllHabitsCompleted
  };
}; 