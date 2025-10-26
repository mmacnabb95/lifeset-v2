export enum MeditationCategory {
  CALM = "Calm",
  MENTAL_CLARITY = "Mental Clarity",
  VISUALISATION = "Visualisation",
  SLEEP = "Sleep",
}

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  category: MeditationCategory;
  audioUrl: string;
  duration: number; // in minutes
  imageUrl?: string;
}

export const CATEGORY_DESCRIPTIONS = {
  [MeditationCategory.CALM]: "Find peace and tranquility in your daily life",
  [MeditationCategory.MENTAL_CLARITY]: "Sharpen your focus and clear your mind",
  [MeditationCategory.VISUALISATION]: "Manifest your goals through guided imagery",
  [MeditationCategory.SLEEP]: "Drift into peaceful, restful sleep",
};

export const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    id: "calm-1",
    title: "Morning Tranquility",
    description: "Start your day with a peaceful, centering meditation",
    category: MeditationCategory.CALM,
    audioUrl: "https://cdk-hnb659fds-assets-987319279921-eu-west-2.s3.eu-west-2.amazonaws.com/Meditation+Assets/Morning+Tranquility.mp3",
    duration: 3,
    imageUrl: "/assets/images/meditation/calm/morning-tranquility.jpg",
  },
  {
    id: "calm-2",
    title: "Afternoon Reset",
    description: "Take a break and find your center",
    category: MeditationCategory.CALM,
    audioUrl: "https://cdk-hnb659fds-assets-987319279921-eu-west-2.s3.eu-west-2.amazonaws.com/Meditation+Assets/Calm.mp3",
    duration: 2,
    imageUrl: "/assets/images/meditation/calm/afternoon-reset.jpg",
  },
  {
    id: "mental-1",
    title: "Focus Flow",
    description: "Enhance your concentration and mental clarity",
    category: MeditationCategory.MENTAL_CLARITY,
    audioUrl: "https://cdk-hnb659fds-assets-987319279921-eu-west-2.s3.eu-west-2.amazonaws.com/Meditation+Assets/Clarity.mp3",
    duration: 3,
    imageUrl: "/assets/images/meditation/mental/focus-flow.jpg",
  },
  {
    id: "mental-2",
    title: "Clear Mind",
    description: "Release mental fog and find clarity",
    category: MeditationCategory.MENTAL_CLARITY,
    audioUrl: "https://cdk-hnb659fds-assets-987319279921-eu-west-2.s3.eu-west-2.amazonaws.com/Meditation+Assets/Clear+Mind.mp3",
    duration: 2,
    imageUrl: "/assets/images/meditation/mental/clear-mind.jpg",
  },
  {
    id: "visual-1",
    title: "Goal Achievement",
    description: "Visualize your success and manifest your goals",
    category: MeditationCategory.VISUALISATION,
    audioUrl: "https://cdk-hnb659fds-assets-987319279921-eu-west-2.s3.eu-west-2.amazonaws.com/Meditation+Assets/Goal+Achievement.mp3",
    duration: 3,
    imageUrl: "/assets/images/meditation/visual/goal-achievement.jpg",
  },
  {
    id: "visual-2",
    title: "Future Self",
    description: "Connect with your ideal future self",
    category: MeditationCategory.VISUALISATION,
    audioUrl: "https://cdk-hnb659fds-assets-987319279921-eu-west-2.s3.eu-west-2.amazonaws.com/Meditation+Assets/Meeting+Future+You.mp3",
    duration: 3,
    imageUrl: "/assets/images/meditation/visual/future-self.jpg",
  },
  {
    id: "sleep-1",
    title: "Peaceful Night",
    description: "Drift into a peaceful sleep",
    category: MeditationCategory.SLEEP,
    audioUrl: "https://cdk-hnb659fds-assets-987319279921-eu-west-2.s3.eu-west-2.amazonaws.com/Meditation+Assets/Peaceful+Night.mp3",
    duration: 4,
    imageUrl: "/assets/images/meditation/sleep/peaceful-night.jpg",
  },
  {
    id: "sleep-2",
    title: "Deep Rest",
    description: "Release tension and prepare for deep sleep",
    category: MeditationCategory.SLEEP,
    audioUrl: "https://cdk-hnb659fds-assets-987319279921-eu-west-2.s3.eu-west-2.amazonaws.com/Meditation+Assets/Deep+Sleep.mp3",
    duration: 3,
    imageUrl: "/assets/images/meditation/sleep/deep-rest.jpg",
  },
]; 