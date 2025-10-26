export enum ForumCategory {
  GENERAL = "General",
  HABITS = "Habits",
  FITNESS = "Fitness",
  MINDFULNESS = "Mindfulness",
  GOALS = "Goals",
}

export interface Reply {
  id: string;
  content: string;
  author: string;
  date: string;
  likes: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: ForumCategory;
  author: string;
  date: string;
  replies: number;
  likes: number;
  replyList?: Reply[];
}

export const CATEGORY_DESCRIPTIONS = {
  [ForumCategory.GENERAL]: "General discussion about wellness and lifestyle",
  [ForumCategory.HABITS]: "Share your habit building journey and tips",
  [ForumCategory.FITNESS]: "Discuss fitness goals and achievements",
  [ForumCategory.MINDFULNESS]: "Explore mindfulness practices and techniques",
  [ForumCategory.GOALS]: "Set and track your personal development goals",
};

// Sample data - replace with actual data from backend
export const FORUM_POSTS: ForumPost[] = [
  {
    id: "1",
    title: "Getting Started with Habit Building",
    content: "Tips for beginning your habit building journey...",
    category: ForumCategory.HABITS,
    author: "HabitBuilder",
    date: "2024-03-15",
    replies: 2,
    likes: 12,
    replyList: [
      {
        id: "r1",
        content: "Great tips! I especially like the morning routine suggestion.",
        author: "ZenStudent",
        date: "2024-03-15",
        likes: 3,
      },
      {
        id: "r2",
        content: "How long did it take you to build your first habit?",
        author: "Beginner123",
        date: "2024-03-15",
        likes: 1,
      },
    ],
  },
  {
    id: "2",
    title: "Weekly Fitness Challenge",
    content: "Join our weekly fitness challenge...",
    category: ForumCategory.FITNESS,
    author: "FitnessCoach",
    date: "2024-03-14",
    replies: 1,
    likes: 15,
    replyList: [
      {
        id: "r3",
        content: "I'm in! Looking forward to starting this challenge.",
        author: "FitnessFanatic",
        date: "2024-03-14",
        likes: 2,
      },
    ],
  },
]; 