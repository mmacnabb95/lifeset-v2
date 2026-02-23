// Mode Loader Service - Fetches mode configuration from Cloud Function
import { httpsCallable } from "firebase/functions";
import { functions, auth, db } from "./config";
import { doc, getDoc } from "firebase/firestore";

export interface ModeResponse {
  mode: string;
  user: {
    uid: string;
    email: string;
    username: string;
    organisationId: string | null;
    role: string | null;
  };
  organisation: {
    organisationId: string;
    name: string;
    type: string;
    logoUrl?: string;
    brandColours: {
      primary: string;
      secondary: string;
    };
    featureFlags: Record<string, boolean>;
  } | null;
  modeConfig: {
    mode: string;
    enabledFeatures: string[];
    navigation: string[];
    contentPack: string;
  };
  contentPack: {
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
  };
  navigation: string[];
}

/**
 * Get mode configuration for the current user
 * Returns consumer mode if user has no organisation
 */
export const getModeConfig = async (): Promise<ModeResponse> => {
  try {
    // Wait for auth to be ready and user to be authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Wait a bit for auth state to stabilize
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Ensure we have a fresh token
    const token = await currentUser.getIdToken(true);
    if (!token) {
      throw new Error("Failed to get auth token");
    }
    
    console.log("getModeConfig: Got token, calling httpsCallable...");
    
    // Try calling the Cloud Function
    try {
      const getMode = httpsCallable(functions, "me");
      const result = await getMode();
      console.log("getModeConfig: Successfully got mode config");
      return result.data as ModeResponse;
    } catch (callableError: any) {
      // When callable fails (FirebaseError, network, etc.), try direct Firestore fallback
      console.log("getModeConfig: Callable failed, trying direct Firestore fallback...", callableError?.code || callableError?.message);
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (!userDoc.exists()) throw callableError;
        
        const userData = userDoc.data();
        const orgId = userData?.activeOrganisationId || userData?.organisations?.[0] || userData?.organisationId;
        
        if (!orgId) {
          // User has no org - return consumer mode with user data
          return {
            mode: "consumer",
            user: {
              uid: currentUser.uid,
              email: currentUser.email || "",
              username: currentUser.displayName || userData?.username || "",
              organisationId: null,
              role: null
            },
            organisation: null,
            modeConfig: {
              mode: "consumer",
              enabledFeatures: ["habits", "challenges", "journaling", "nutrition", "workouts"],
              navigation: ["Home", "Habits", "Journal", "Recipes", "Workouts", "Settings"],
              contentPack: "consumerPack"
            },
            contentPack: { defaultHabits: [], defaultChallenges: [], onboardingScreens: [] },
            navigation: ["Home", "Habits", "Journal", "Recipes", "Workouts", "Settings"]
          };
        }
        
        const orgDoc = await getDoc(doc(db, "organisations", orgId));
        if (!orgDoc.exists()) throw callableError;
        
        const org = orgDoc.data();
        const modeConfig = {
          mode: org?.type || "gym",
          enabledFeatures: ["habits", "challenges", "journaling", "nutrition", "workouts", "classes", "memberships"],
          navigation: ["Home", "Classes", "Membership", "Journal", "Recipes", "Workouts", "Settings"],
          contentPack: org?.contentPack || "gymPack"
        };
        
        return {
          mode: org?.type || "gym",
          user: {
            uid: currentUser.uid,
            email: currentUser.email || "",
            username: currentUser.displayName || userData?.username || "",
            organisationId: orgId,
            role: userData?.role || "member"
          },
          organisation: {
            organisationId: orgId,
            name: org?.name || "",
            type: org?.type || "gym",
            logoUrl: org?.logoUrl || org?.landingPage?.logoUrl,
            brandColours: org?.brandColours || { primary: "#4e8fea", secondary: "#FFFFFF" },
            featureFlags: org?.featureFlags || {}
          },
          modeConfig,
          contentPack: { defaultHabits: [], defaultChallenges: [], onboardingScreens: [] },
          navigation: modeConfig.navigation
        };
      } catch (fallbackError) {
        console.warn("getModeConfig: Firestore fallback failed, rethrowing", fallbackError);
        throw callableError;
      }
    }
  } catch (error: any) {
    console.error("Error loading mode config:", error);
    
    const u = auth.currentUser;
    const consumerFallback: ModeResponse = {
      mode: "consumer",
      user: {
        uid: u?.uid || "",
        email: u?.email || "",
        username: u?.displayName || "",
        organisationId: null,
        role: null
      },
      organisation: null,
      modeConfig: {
        mode: "consumer",
        enabledFeatures: ["habits", "challenges", "journaling", "nutrition", "workouts"],
        navigation: ["Home", "Habits", "Journal", "Recipes", "Workouts", "Settings"],
        contentPack: "consumerPack"
      },
      contentPack: { defaultHabits: [], defaultChallenges: [], onboardingScreens: [] },
      navigation: ["Home", "Habits", "Journal", "Recipes", "Workouts", "Settings"]
    };
    return consumerFallback;
  }
};

