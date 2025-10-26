import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export const fireMediumHapticFeedback = () => {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};
