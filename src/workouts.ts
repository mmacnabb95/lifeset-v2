export const workoutData = {
  featuredWorkouts: [
    {
      id: '3',
      title: "Laura Nolan's Workout",
      description: 'Workout like a Dance Professional!',
      imageUrl: 'https://images.unsplash.com/photo-1749145764456-3af7f2949cbf',
      workoutId: 790,
    },
    {
      id: '2',
      title: 'Build Muscle in 5 Days',
      description: "Let's build!",
      imageUrl: 'https://images.unsplash.com/photo-1596357395217-80de13130e92',
      workoutId: 1,
    },
  ],
  quickHomeWorkouts: [
    {
      id: '3',
      title: '4 Day Home Workout',
      description: 'Tone up quickly!',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      workoutId: 173,
    },
    {
      id: '2',
      title: '10 min Full Body!',
      description: 'Tone up at home!',
      imageUrl: 'https://images.unsplash.com/photo-1686247166526-f785a343ef23',
      workoutId: 750,
    },
  ]
};

export interface Workout {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  workoutId: number;
}

export type WorkoutData = typeof workoutData;