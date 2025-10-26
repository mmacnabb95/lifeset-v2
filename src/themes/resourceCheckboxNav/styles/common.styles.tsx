import { Dimensions, StyleSheet } from "react-native";

import constants from "../constants";
import commonConstants from "../../constants";

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
      maxHeight: constants.containerMaxHeight,
      ...constants.shadow,
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    textContainer: {
      height: constants.textContainerHeight,
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    textContainerPadding: {
      height: constants.textContainerHeight + 10,
      marginLeft: 10,
    },
    text: {
      // marginBottom: 6,
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
      marginRight: 10,
    },
  });
};

export default useStyles;
