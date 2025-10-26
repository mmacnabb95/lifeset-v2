import { Dimensions, StyleSheet } from "react-native";

import commonConstants from "src/themes/constants";
import constants from "../constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    container: {
      backgroundColor: "#ffffff",
      borderRadius: constants.radius,
      flexDirection: "row",
      alignItems: "center",
      alignContent: "space-between",
      padding: 10,
      marginHorizontal: 0,
      marginVertical: 4,
      minHeight: constants.containerMinHeight,
      width: windowWidth > commonConstants.mobileBreak ? "49%" : "100%",
      maxWidth: constants.containerMaxWidth,
      // maxHeight: constants.containerMaxHeight,
      ...constants.shadow,
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      height: "100%",
    },
    textContainer: {
      // height: constants.textContainerHeight,
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    textContainerPadding: {
      marginLeft: 10,
    },
    text: {
      paddingVertical: 0,
      marginVertical: 2.5,
    },
    thumbnail: {
      marginRight: 10,
      borderRadius: constants.radius,
      overflow: "hidden",
    },
    categoryView: {
      flexDirection: "row",
    },
    icon: {
      width: 30,
      borderColor: commonConstants.transparent,
      marginLeft: 15,
    },
  });
};

export default useStyles;
