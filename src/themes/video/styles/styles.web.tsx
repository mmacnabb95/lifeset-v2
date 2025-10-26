import { Dimensions, StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";
import commonConstants from "../../constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();

  const windowWidth = Dimensions.get("window").width;

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
    },
    video: {
      ...commonStyles.video,
      width: playerWidth,
      height: playerHeight,
    },
    videoFullScreen: {
      ...commonStyles.videoFullScreen,
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });
};

export default useStyles;
