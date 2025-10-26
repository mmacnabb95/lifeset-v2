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
      padding: 20,
      marginHorizontal: 0,
      marginVertical: 10,
      minHeight: constants.containerMinHeight,
      width: "100%",
      maxWidth: constants.containerMaxWidth,
      maxHeight: constants.containerMaxHeight,
      ...constants.shadow,
    },
    title: {
      paddingRight: 10,
      flexBasis: 100,
    },
    left: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: "30%",
    },
    line: {
      height: 50,
      width: 1,
      backgroundColor: commonConstants.grey300,
      marginRight: 10,
      marginLeft: 10,
    },
    text: {
      marginBottom: 6,
    },
    thumbnailContainer: {
      marginRight: 20,
      borderRadius: 100,
      width: 48,
      height: 48,
      overflow: "hidden",
    },
    thumbnail: {},
    categoryView: {
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 10,
      maxWidth: "30%",
    },
    buttonContainer: {
      flexBasis: 200,
      marginLeft: 50,
    },
  });
};

export default useStyles;
