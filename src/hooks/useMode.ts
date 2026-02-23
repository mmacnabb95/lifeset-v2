// useMode Hook - Provides mode configuration and organisation data
import { useState, useEffect } from "react";
import { getModeConfig, ModeResponse } from "../services/firebase/mode-loader";
import { useFirebaseUser } from "./useFirebaseUser";
import { auth } from "../services/firebase/config";

export const useMode = () => {
  const { userId } = useFirebaseUser();
  const [modeData, setModeData] = useState<ModeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadMode();
  }, [userId]);

  const loadMode = async () => {
    if (!auth.currentUser) {
      console.log("useMode: No current user, skipping loadMode.");
      setLoading(false);
      setModeData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Wait a bit for auth to fully initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ensure a fresh token is used for the callable function
      const token = await auth.currentUser.getIdToken(true);
      if (!token) {
        throw new Error("Failed to get auth token");
      }
      
      console.log("useMode: Got auth token, calling getModeConfig...");
      const data = await getModeConfig();
      setModeData(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load mode");
      setError(error);
      console.error("Error loading mode:", error);
      
      // Fallback to consumer mode on error
      setModeData({
        mode: "consumer",
        user: {
          uid: userId || "",
          email: auth.currentUser?.email || "",
          username: auth.currentUser?.displayName || "",
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
        contentPack: {
          defaultHabits: [],
          defaultChallenges: [],
          onboardingScreens: []
        },
        navigation: ["Home", "Habits", "Journal", "Recipes", "Workouts", "Settings"]
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    mode: modeData?.mode || "consumer",
    organisation: modeData?.organisation,
    modeConfig: modeData?.modeConfig,
    contentPack: modeData?.contentPack,
    navigation: modeData?.navigation || [],
    isConsumerMode: !modeData?.organisation,
    hasFeature: () => true, // Feature flags removed - all features always available
    loading,
    error,
    refetch: loadMode
  };
};

