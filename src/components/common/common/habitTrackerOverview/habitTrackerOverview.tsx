import React, { useState } from "react";
import { DashboardTile } from "../dashboardTile/dashboardTile";
import { Pressable } from "react-native";
import DailyHabitsScreen from "src/pages/user/dailyHabits/dailyHabits";
import { fireMediumHapticFeedback } from "src/utils/haptics";
import { useFocusEffect } from "@react-navigation/native";

export const HabitTrackerOverview = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const [scale, setScale] = useState(1);

  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => setScale(0.9), 100);
    }, []),
  );

  return (
    <DashboardTile style={{ padding: 0, overflow: "hidden", height: 280 }}>
      <Pressable
        onPress={() => {
          fireMediumHapticFeedback();
          navigation.navigate("Habits");
        }}
        style={({ pressed }) => [
          {
            height: "100%",
            width: "100%",
            opacity: pressed ? 0.1 : 0,
            backgroundColor: "#FFFFFF",
            position: "absolute",
            zIndex: 100,
          },
        ]}
      />
      <DailyHabitsScreen
        navigation={navigation}
        route={route}
        summaryOnly
        style={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 12,
          // maxHeight: 300,
          transform: [{ scale: scale }],
        }}
        scrollEnabled={false}
      />
    </DashboardTile>
  );
};
