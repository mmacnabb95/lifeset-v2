import React from "react";
import { View, ActivityIndicator } from "react-native";

export const Loading = ({
  size,
  color,
}: {
  size?: "large" | "small";
  color?: string;
}) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size={size || "large"} color={color} />
    </View>
  );
};
