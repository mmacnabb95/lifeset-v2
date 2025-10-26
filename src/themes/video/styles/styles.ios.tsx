import { Dimensions, StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";
import { useCallback, useEffect, useState } from "react";
import { Orientation } from "expo-screen-orientation";
import * as ScreenOrientation from "expo-screen-orientation";
import commonConstants from "../../constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  const [orientation, setOrientation] = useState<Orientation | undefined>();

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

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

  useEffect(() => {
    getOrientation();
  }, []);

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
  const playerWidth = formWidth;

  return StyleSheet.create({
    containerFullScreen: {
      ...commonStyles.containerFullScreen,
    },
    container: {
      ...commonStyles.container,
    },
    videoContainer: {
      ...commonStyles.videoContainer,
      width: isPortraight() ? windowHeight - 60 : playerHeight,
    },
    video: {
      ...commonStyles.video,
      width: playerWidth,
      height: playerHeight,
    },
    videoFullScreen: {
      ...commonStyles.videoFullScreen,
      width: isPortraight() ? windowHeight - 60 : playerHeight,
    },
  });
};

export default useStyles;
