export interface ModeConfig {
  mode: string;
  enabledFeatures: string[];
  navigation: string[];
  contentPack: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
  };
}

export interface ContentPack {
  defaultHabits: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  defaultChallenges: Array<{
    name: string;
    description: string;
    duration: number;
  }>;
  onboardingScreens: Array<{
    title: string;
    description: string;
    imageUrl: string;
  }>;
}

