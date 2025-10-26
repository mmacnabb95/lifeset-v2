import React from "react";
import { View } from "react-native";
import { Typography, WebFadeIn } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";

const useStyles = require("./styles/styles").default;

export const WorkoutFilter = ({ navigation }: { navigation: any }) => {
  const styles = useStyles();

  return (
    <WebFadeIn background={false}>
      <Typography type={TypographyTypes.H4} text="Let's  move!" />
    </WebFadeIn>
  );
};
