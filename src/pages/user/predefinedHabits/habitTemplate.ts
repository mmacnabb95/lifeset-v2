export interface HabitTemplate {
  Category: string;
  habits: { Name: string }[];
}

export const habitTemplates = [
  {
    Category: "Movement",
    habits: [
      {
        Name: "Walk",
        Description:
          "Take time to clear your mind and help lose fat with this habit.",
        Category: 1,
        FromTest: true,
      },
      {
        Name: "Run",
        Description: "Take time for your heart and your head with this habit.",
        Category: 1,
      },
      {
        Name: "Gym",
        Description: "Move better and look better with this habit.",
        Category: 1,
      },
      {
        Name: "Yoga",
        Description: "Move and feel better with this habit.",
        Category: 1,
      },
    ],
  },
  {
    Category: "Mindset",
    habits: [
      {
        Name: "Meditate",
        Description: "Build focus and clear your mind with this habit.",
        Category: 2,
      },
      {
        Name: "Gratitude journal",
        Description: "Build happiness in the present with this habit.",
        Category: 2,
      },
      {
        Name: "Talk to a loved one",
        Description: "Reduce stress and improve your mood with this habit.",
        Category: 2,
      },
      {
        Name: "No phone before 10am",
        Description:
          "Remove distractions and focus on the present with this habit.",
        Category: 2,
      },
    ],
  },
  {
    Category: "Food",
    habits: [
      {
        Name: "Morning fast",
        Description:
          "Make fat loss easier and improve clarity with this habit.",
        Category: 3,
      },
      {
        Name: "Hit calorie target",
        Description:
          "Get the key to hitting your weight target with this habit.",
        Category: 3,
      },
      {
        Name: "Hit protein target",
        Description: "Stop cravings and gain muscle with this habit.",
        Category: 3,
      },
      {
        Name: "No gluten",
        Description: "Help your gut health by building this habit.",
        Category: 3,
      },
    ],
  },
];
