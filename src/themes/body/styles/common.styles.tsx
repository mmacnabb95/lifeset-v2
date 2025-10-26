import { Dimensions, StyleSheet } from "react-native";

import constants from "src/themes/body/constants";
import commonConstants from "src/themes/constants";
import { videoPlayerFullScreen } from "../../../redux/features/misc/slice";
import { useSelector } from "react-redux";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;
  const videoFullScreen = useSelector(videoPlayerFullScreen);

  return StyleSheet.create({
    container: {
      width: "100%",
      // borderWidth: 1,
    },
    fullScreenContainer: {
      position: "absolute",
      height: "100%",
      maxHeight: "100%",
      width: "100%",
    },
    body: {
      width: "100%",
      marginHorizontal: "auto",
      flexGrow: 1,
      maxWidth: commonConstants.maxPageWidth,
    },
    fullScreenBody: {
      position: "absolute",
      backgroundColor: constants.fullScreenBackgroundColor,
      width: "100%",
      alignItems:
        windowWidth > commonConstants.mobileBreak ? "flex-start" : "center",
      display: "flex",
      height: "100%",
      maxHeight: "100%",
      overflow: "hidden",
      padding: 0,
    },
    parentSubContainer: {
      flexGrow: 1,
      width: "100%",
      alignItems: "center",
      flexDirection: "column",
    },
    centerAligned: {
      flex: 1,
      width: "100%",
      maxWidth: videoFullScreen ? "100%" : constants.maxPageWidth,
    },
  });
};

export default useStyles;
