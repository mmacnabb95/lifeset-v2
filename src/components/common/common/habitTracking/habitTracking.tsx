import React from "react";
import { View } from "react-native";
import { enGB, registerTranslation } from "react-native-paper-dates";
import { Habit } from "../../../../../types/domain/flat-types";
import { WebFadeIn } from "../webFadeIn";
registerTranslation("en-GB", enGB);

const useStyles = require("./styles/styles").default;
const useLayoutStyles =
  require("../../../../themes/layout/styles/styles").default;

export const HabitTracking = ({
  formRef,
  habit,
}: {
  formRef: any;
  habit: Habit;
}) => {
  const styles = useStyles();

  return (
    <WebFadeIn>
      {/* <View style={[[layoutStyles.page, cmsStyles?.habitEditPage]]} /> */}
      <View />
    </WebFadeIn>
  );
};
