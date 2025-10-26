import { Dimensions, StyleSheet } from "react-native";

import commonConstants from "src/themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;
  return StyleSheet.create({
    header: {
      width: "100%",
      alignItems: "flex-start",
    },
    headerTopBar: {},
    backButton: {},
    title: {
      // marginTop: windowWidth > commonConstants.mobileBreak ? 30 : 20,

      // marginBottom: windowWidth > commonConstants.mobileBreak ? 30 : 10,
      // paddingTop: 0,
      // width: "100%",
      fontSize: 14,
      // marginBottom: -35,
      paddingLeft: 14,
      color: commonConstants.grey400,
      minHeight: 47,
      paddingTop: 6,
    },
    preamble: {},
  });
};

export default useStyles;
