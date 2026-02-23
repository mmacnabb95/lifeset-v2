// Goal Templates for Quick Start
// Pre-made goals that users can select during onboarding

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'health' | 'productivity' | 'mental-health' | 'nutrition' | 'other';
  suggestedHabits: string[]; // Habit IDs that will be suggested
  targetCompletions?: number;
  targetDays?: number; // Target days to complete (e.g., 30 days)
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  // Fitness Goals
  {
    id: 'lose-weight',
    title: 'Lose Weight',
    description: 'Build healthy habits to reach your weight loss goals',
    category: 'fitness',
    suggestedHabits: ['workout-daily', 'track-meals', 'drink-water', 'walk-10000'],
    targetCompletions: 90, // 90 habit completions (3 months)
  },
  {
    id: 'build-muscle',
    title: 'Build Muscle',
    description: 'Gain strength and muscle through consistent workouts',
    category: 'fitness',
    suggestedHabits: ['strength-training', 'protein-intake', 'rest-recovery', 'track-progress'],
    targetCompletions: 120, // 4 months
  },
  {
    id: 'run-5k',
    title: 'Run a 5K',
    description: 'Train to complete your first 5K race',
    category: 'fitness',
    suggestedHabits: ['running', 'stretching', 'rest-days', 'track-distance'],
    targetDays: 60, // 60 days
  },
  {
    id: 'daily-workout',
    title: 'Workout Daily',
    description: 'Build a consistent daily exercise routine',
    category: 'fitness',
    suggestedHabits: ['morning-workout', 'stretching', 'track-workouts'],
    targetCompletions: 90,
  },

  // Health Goals
  {
    id: 'better-sleep',
    title: 'Improve Sleep',
    description: 'Establish a healthy sleep routine for better rest',
    category: 'health',
    suggestedHabits: ['bedtime-routine', 'no-phone-bed', 'wake-early', 'meditation'],
    targetCompletions: 60,
  },
  {
    id: 'drink-more-water',
    title: 'Drink More Water',
    description: 'Stay hydrated throughout the day',
    category: 'health',
    suggestedHabits: ['water-intake', 'morning-water', 'track-water'],
    targetCompletions: 30,
  },
  {
    id: 'reduce-stress',
    title: 'Reduce Stress',
    description: 'Build habits to manage stress and improve wellbeing',
    category: 'mental-health',
    suggestedHabits: ['meditation', 'journaling', 'breathing-exercises', 'nature-walk'],
    targetCompletions: 60,
  },

  // Productivity Goals
  {
    id: 'morning-routine',
    title: 'Build Morning Routine',
    description: 'Start each day with intention and purpose',
    category: 'productivity',
    suggestedHabits: ['wake-early', 'morning-meditation', 'journaling', 'exercise', 'healthy-breakfast'],
    targetCompletions: 60,
  },
  {
    id: 'read-more',
    title: 'Read More Books',
    description: 'Make reading a daily habit',
    category: 'productivity',
    suggestedHabits: ['read-daily', 'reading-time', 'track-books'],
    targetCompletions: 30,
  },
  {
    id: 'limit-screen-time',
    title: 'Reduce Screen Time',
    description: 'Spend less time on your phone and more time living',
    category: 'productivity',
    suggestedHabits: ['no-phone-morning', 'screen-time-limit', 'phone-free-meals'],
    targetCompletions: 45,
  },
  {
    id: 'be-more-organised',
    title: 'Be More Organised',
    description: 'Build systems and habits to stay organized and productive',
    category: 'productivity',
    suggestedHabits: ['wake-early', 'journaling', 'plan-to-do-list', 'keep-space-tidy'],
    targetCompletions: 60,
  },

  // Nutrition Goals
  {
    id: 'eat-healthy',
    title: 'Eat Healthier',
    description: 'Make better food choices and build healthy eating habits',
    category: 'nutrition',
    suggestedHabits: ['meal-prep', 'track-meals', 'vegetables-daily', 'cook-at-home'],
    targetCompletions: 90,
  },
  {
    id: 'meal-prep',
    title: 'Meal Prep Weekly',
    description: 'Prepare healthy meals in advance',
    category: 'nutrition',
    suggestedHabits: ['meal-prep-sunday', 'plan-meals', 'cook-at-home'],
    targetCompletions: 52, // Weekly for a year
  },
];

