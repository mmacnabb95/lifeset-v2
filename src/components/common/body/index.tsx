import React from "react";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-aware-scroll-view";
import { Platform, View, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { videoPlayerFullScreen } from "../../../redux/features/misc/slice";

const useCommonStyles = require("../../../themes/body/styles/styles").default;

type Style = Record<string, string | number>;

interface BodyProps {
  children: React.ReactNode;
  contentStyle?: any;
  style?: any;
}

export const Body = ({ children, contentStyle, style }: BodyProps) => {
  const commonStyles = useCommonStyles();

  const videoFullScreen = useSelector(videoPlayerFullScreen);

  const getScrollEnabled = () => {
    if (videoFullScreen) {
      return false;
    } else if (style !== undefined) {
      return true;
    }
    return true;
  };

  return (
    <ScrollView 
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentStyle]}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    paddingBottom: 20,
  },
});
