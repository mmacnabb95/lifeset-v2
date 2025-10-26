import { Dimensions, StyleSheet } from "react-native";
import commonConstants from "src/themes/constants";
import { useCallback, useEffect, useState } from "react";
import { Orientation } from "expo-screen-orientation";
import * as ScreenOrientation from "expo-screen-orientation";
import constants from "../constants";

const useStyles = () => {
  const [orientation, setOrientation] = useState<Orientation | undefined>();

  const windowWidth = Dimensions.get("window").width;

  const isPortraight = useCallback(
    () =>
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
      orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN,
    [orientation],
  );

  const getOrientation = async () => {
    let _orientation = await ScreenOrientation.getOrientationAsync();
    setOrientation(_orientation);
  };

  const getFormWidth = () => {
    if (windowWidth > commonConstants.mobileBreak) {
      const max = commonConstants.maxPageWidth;
      return windowWidth - 320 - 70 > max ? max : windowWidth - 320 - 70;
    } else {
      return windowWidth - 40;
    }
  };

  const formWidth = getFormWidth();
  const playerHeight = (formWidth / 16) * 9;

  useEffect(() => {
    getOrientation();
  }, []);

  return StyleSheet.create({
    containerFullScreen: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "black",
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      zIndex: constants.containerFullScreenZIndex,
    },
    container: {
      flex: 1,
      flexShrink: 1,
      justifyContent: "center",
      alignItems: "center",
      width: formWidth,
      maxWidth: "100%",
      marginBottom: 19,
      overflow: "hidden",
      height: playerHeight,
      maxHeight: playerHeight,
    },

    videoContainer: isPortraight()
      ? {
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: "black",
          width: "100%",
          transform: [{ rotate: "90deg" }],
        }
      : {},

    video: {},
    videoFullScreen: {},
  });
};

export default useStyles;
