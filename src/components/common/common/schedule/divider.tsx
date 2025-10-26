import React from "react";
const useStyles = require("./styles/styles").default;
import { StyleProp, View, ViewStyle } from "react-native";

export const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  const styles = useStyles();
  return <View style={[styles.divider, style]} />;
};
