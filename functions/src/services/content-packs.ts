import { ContentPack } from "../types/mode";

/**
 * Content Packs
 * 
 * Note: 
 * - Default habits removed (users create their own)
 * - Default challenges kept for future use (challenges widget not yet implemented)
 * - Onboarding screens kept for future use (not currently integrated with mobile app onboarding)
 */
export const CONTENT_PACKS: Record<string, ContentPack> = {
  consumerPack: {
    defaultHabits: [],
    defaultChallenges: [],
    onboardingScreens: []
  },
  gymPack: {
    defaultHabits: [],
    defaultChallenges: [
      // Reserved for future challenges feature
      // { name: "30-Day Strength Challenge", description: "Build muscle in 30 days", duration: 30 }
    ],
    onboardingScreens: [
      // Reserved for future organisation-specific onboarding
      // { 
      //   title: "Welcome to [Gym Name]", 
      //   description: "Your fitness journey starts here. Track workouts, book classes, and achieve your goals.", 
      //   imageUrl: "" 
      // }
    ]
  },
  corporatePack: {
    defaultHabits: [],
    defaultChallenges: [
      // Reserved for future challenges feature
    ],
    onboardingScreens: [
      // Reserved for future organisation-specific onboarding
    ]
  },
  yogaPack: {
    defaultHabits: [],
    defaultChallenges: [
      // Reserved for future challenges feature
    ],
    onboardingScreens: [
      // Reserved for future organisation-specific onboarding
    ]
  },
  pilatesPack: {
    defaultHabits: [],
    defaultChallenges: [
      // Reserved for future challenges feature
    ],
    onboardingScreens: [
      // Reserved for future organisation-specific onboarding
    ]
  },
  hiitPack: {
    defaultHabits: [],
    defaultChallenges: [
      // Reserved for future challenges feature
    ],
    onboardingScreens: [
      // Reserved for future organisation-specific onboarding
    ]
  },
  saunaPack: {
    defaultHabits: [],
    defaultChallenges: [],
    onboardingScreens: [
      // Reserved for future organisation-specific onboarding
    ]
  }
};

export async function getContentPack(packName: string): Promise<ContentPack> {
  return CONTENT_PACKS[packName] || CONTENT_PACKS.consumerPack;
}

