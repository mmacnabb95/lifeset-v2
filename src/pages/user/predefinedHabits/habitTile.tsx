import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Image, Pressable, Platform } from "react-native";
import { Icon, Typography } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import constants from "src/themes/constants";
import * as Haptics from "expo-haptics";
import { useDispatch } from "react-redux";
import { setPredefinedHabit } from "src/redux/features/misc/slice";
import { Habitpackhabit } from "../../../../../types/domain/flat-types";
import { ScheduledHabit } from "./predefinedHabits";

const useStyles = require("./styles/styles").default;

export interface PredefinedHabit {
  Name: string;
  Category: number;
  Description: string;
  FromTemplate?: boolean;
  UserHabitPack?: number;
}

export const HabitTile = ({
  habit,
  disabled,
}: {
  habit: PredefinedHabit | ScheduledHabit;
  disabled?: boolean;
}) => {
  const styles = useStyles();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        dispatch(setPredefinedHabit(habit));
        navigation.navigate("HabitEdit", {
          habitId: "new",
          predefined: "true",
          fromPack: !!habit?.UserHabitPack,
        });
      }}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: pressed ? constants.pressed : constants.white,
        },
      ]}
    >
      {/* <View style={styles.habitIcon}>
        <Image
          source={require("../../../../assets/yoga.png")}
          style={{ height: 44, width: 44 }}
        />
      </View> */}

      <Typography
        text={habit?.Name}
        type={TypographyTypes.Body1}
        style={styles.habitText}
        numberOfLines={1}
      />
    </Pressable>
  );
};
