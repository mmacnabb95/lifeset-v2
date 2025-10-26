import React from "react";
import { View } from "react-native";
import { Typography, TypographyTypes } from "../typography";

const useCommonStyles = require("../../../themes/layout/styles/styles").default;

type Style = Record<string, string | number>;
export const AuthHeader = ({
  title,
  preamble,
  style,
}: {
  title: string;
  preamble: string;
  style?: Record<string, Style>;
}) => {
  const commonStyles = useCommonStyles();

  return (
    <View>
      <Typography
        type={TypographyTypes.H1}
        style={[commonStyles.authTitle, style?.title]}
        text={title}
      />

      <Typography
        type={TypographyTypes.Body1}
        style={[commonStyles.authPreamble, style?.preamble]}
        text={preamble}
      />
    </View>
  );
};
