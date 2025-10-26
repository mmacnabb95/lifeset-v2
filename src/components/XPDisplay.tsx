import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { useXP } from "../useXP";
import {
  getMotivationalMessage,
  getPercentile,
  getTierName,
} from "../utils/xpPercentileMapper";

const getEmoji = (tierName: string): string => {
  switch (tierName) {
    case "Apex":
      return "👑";
    case "Legend":
      return "⚡";
    case "Visionary":
      return "🌟";
    case "Luminary":
      return "💫";
    case "Champion":
      return "🏆";
    case "Innovator":
      return "💡";
    case "Pioneer":
      return "🚀";
    case "Achiever":
      return "⭐";
    case "Explorer":
      return "🌎";
    case "Pathfinder":
      return "🎯";
    default:
      return "✨";
  }
};

const getTextColor = (tierName: string): string => {
  switch (tierName) {
    case "Apex":
      return "#B8860B"; // Darker Gold
    case "Legend":
      return "#C51162"; // Darker Pink
    case "Visionary":
      return "#4A148C"; // Darker Purple
    case "Luminary":
      return "#0D47A1"; // Darker Blue
    case "Champion":
      return "#1B5E20"; // Darker Green
    case "Innovator":
      return "#006064"; // Darker Cyan
    case "Pioneer":
      return "#BF360C"; // Darker Orange
    case "Achiever":
      return "#FF8F00"; // Darker Amber
    case "Explorer":
      return "#33691E"; // Darker Light Green
    case "Pathfinder":
      return "#01579B"; // Darker Light Blue
    default:
      return "#4A148C"; // Darker Purple
  }
};

export const XPDisplay: React.FC = () => {
  const { totalXP } = useXP();
  const motivationalMessage = getMotivationalMessage(totalXP);
  const [topLine] = motivationalMessage.split("\n");
  const tierName = getTierName(totalXP);
  const emoji = getEmoji(tierName);
  const textColor = getTextColor(tierName);

  return (
    <View style={styles.container}>
      <Text
        style={[styles.percentileText, { color: textColor }]}
        numberOfLines={2}
      >
        {topLine} {emoji}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 0,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    minHeight: 16,
  },
  percentileText: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "left",
    marginVertical: 3,
    paddingLeft: 0,
  },
});
