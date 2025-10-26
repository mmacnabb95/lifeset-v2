export enum RecipeCategory {
  BREAKFAST = "Breakfast",
  LUNCH = "Lunch",
  DINNER = "Dinner",
  SNACKS = "Snacks",
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  ingredients: string[];
  steps: string[];
  duration: number; // in minutes
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const CATEGORY_DESCRIPTIONS = {
  [RecipeCategory.BREAKFAST]: "Start your day with high-protein, nutritious meals",
  [RecipeCategory.LUNCH]: "Power through your day with lean, protein-rich options",
  [RecipeCategory.DINNER]: "End your day with satisfying, low-calorie dishes",
  [RecipeCategory.SNACKS]: "Healthy, protein-packed bites between meals",
};

// Import recipes from json file
import recipesData from '../../../data/recipes.json';
export const RECIPES: Recipe[] = recipesData.recipes.map(recipe => ({
  ...recipe,
  category: recipe.category as RecipeCategory
}));

export default {
  colors: {
    background: '#EFEEF5',
    text: {
      primary: '#000000',
      secondary: '#666666'
    }
  },
  typography: {
    size: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 20
    }
  },
  white: '#FFFFFF',
  black900: '#000000',
  black600: '#666666',
  background: '#EFEEF5',
  primary: '#007AFF',
  spacing: {
    small: 8,
    medium: 16,
    large: 24
  }
}; 