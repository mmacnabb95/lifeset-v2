import { Dimensions, StyleSheet } from "react-native";

import constants from "../constants";
import commonConstants from "../../constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    container: {
      backgroundColor: constants.background,
      paddingHorizontal: 6,
      marginHorizontal: windowWidth > commonConstants.mobileBreak ? 0 : 0,
      marginVertical: windowWidth > commonConstants.mobileBreak ? 10 : 6,
      width: windowWidth > commonConstants.mobileBreak ? "49%" : "100%",
      borderRadius: constants.radius,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingLeft: 16,
      paddingRight: 16,
      ...commonConstants.shadowMedium,
    },
    icon: {
      marginRight: 10,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
};

export default useStyles;
