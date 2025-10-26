import React, { ReactNode } from "react";
import { View } from "react-native";
import constants from "src/themes/constants";
type Style = Record<string, string | number>;

export const DashboardTile = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: Style[] | Style;
}) => {
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: "rgba(52, 140, 224, 0.10);",
          // height: 350,
          width: "100%",
          borderRadius: 24,
          backgroundColor: "#FFFFFF",
          padding: 15,
          marginBottom: 8,
          ...constants.shadowMedium,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
