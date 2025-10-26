import React from "react";
import { Typography, TypographyTypes } from "../typography";
import { PredefinedHabit } from "src/pages/user/predefinedHabits/habitTile";
import { ScheduledHabit } from "src/pages/user/predefinedHabits/predefinedHabits";
import { View } from "react-native";
import constants from "src/themes/constants";
import { useRoute } from "@react-navigation/native";

export const HabitPackNotice = ({
  habit,
}: {
  habit: PredefinedHabit | ScheduledHabit;
}) => {
  const route = useRoute();

  if (route?.params?.fromPack !== true) {
    return null;
  } else {
    return (
      <View
        style={{
          backgroundColor: constants.appBackground,
          paddingBottom: 30,
        }}
      >
        <View
          style={{
            borderRadius: 12,
            padding: 20,
            backgroundColor: constants.white,
          }}
        >
          <Typography
            type={TypographyTypes.Body1}
            text="You are viewing a habit in a habit pack. Press “Add all” to add this and the other habits in the pack to your schedule."
          />
        </View>
      </View>
    );
  }
};
