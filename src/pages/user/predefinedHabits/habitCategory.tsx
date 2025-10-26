import React, { useState } from "react";
import { View } from "react-native";
import { Typography } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { HabitTile, PredefinedHabit } from "./habitTile";
import { ScheduledHabit } from "./predefinedHabits";
import { useDispatch } from "react-redux";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import _ from "lodash";
import { useNavigation } from "@react-navigation/native";
import { AddAllHabitsInPack } from "src/components/common/addAllHabitsInPack/addAllHabitsInPack";

const useStyles = require("./styles/styles").default;

export const HabitCategory = ({
  title,
  habits,
  author,
  addAllOnly,
}: {
  title: string;
  habits: PredefinedHabit[] | ScheduledHabit[];
  author?: string;
  addAllOnly?: boolean;
}) => {
  const styles = useStyles();

  return (
    <View style={styles.predfeinedHabitTypeContainer}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <View
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: "68%" }}>
            <Typography
              text={title}
              type={TypographyTypes.Subtitle2}
              numberOfLines={5}
            />
            {!!author && (
              <Typography
                text={`Created by ${author}`}
                type={TypographyTypes.Body1}
                style={{ fontSize: 14, opacity: 0.8 }}
              />
            )}
          </View>
          {addAllOnly && <AddAllHabitsInPack habits={habits} />}
        </View>
      </View>
      <View style={styles.predefinedTiles}>
        {habits?.map((h: PredefinedHabit | ScheduledHabit) => {
          return <HabitTile key={h.Name} habit={h} />;
        })}
      </View>
    </View>
  );
};
