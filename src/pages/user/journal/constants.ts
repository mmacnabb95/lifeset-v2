import { IconTypes } from "../../../components/common/icon";

interface Category {
  id: number;
  name: string;
  icon: IconTypes;
  screen: string;
  category: string;
  emoji: string;
  description: string;
}

export enum Categories {
  MyGratitude = 'MyGratitude',
  MyGoals = 'MyGoals',
  Thoughts = 'Thoughts',
  CheckIn = 'CheckIn'
}

export const CATEGORIES = [
  {
    id: 1,
    category: Categories.MyGratitude,
    name: 'Gratitude',
    emoji: '🙏',
    description: 'What are you grateful for?'
  },
  {
    id: 2,
    category: Categories.MyGoals,
    name: 'Goals',
    emoji: '🎯',
    description: 'What goals are you working on?'
  },
  {
    id: 3,
    category: Categories.Thoughts,
    name: 'Thoughts',
    emoji: '💭',
    description: 'What\'s on your mind?'
  },
  {
    id: 4,
    category: Categories.CheckIn,
    name: 'Check In',
    emoji: '✨',
    description: 'How are you?'
  }
];

export const CategoryLabels = {
  [Categories.MyGratitude]: 'Gratitude',
  [Categories.MyGoals]: 'Goals',
  [Categories.Thoughts]: 'Thoughts',
  [Categories.CheckIn]: 'Check In'
};

// Add category mappings that can be shared across components
export const SAVE_CATEGORY_MAPPING: Record<Categories, string> = {
  [Categories.Thoughts]: 'MyJournalEntries',
  [Categories.MyGratitude]: 'MyGratitude',
  [Categories.MyGoals]: 'MyGoals',
  [Categories.CheckIn]: 'CheckIn'
};

export const LEGACY_CATEGORY_MAPPING: Record<string, Categories> = {
  'MyJournalEntries': Categories.Thoughts,
  'MyGratitude': Categories.MyGratitude,
  'MyGoals': Categories.MyGoals,
  'CheckIn': Categories.CheckIn,
  'RelaxList': Categories.Thoughts // Keep this as a fallback for legacy entries
};
