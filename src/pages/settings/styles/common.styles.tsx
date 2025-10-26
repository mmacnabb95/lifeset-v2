import { Dimensions, StyleSheet } from "react-native";

import commonConstants from "src/themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    changeEmailForm: {
      flexDirection: "column",
      justifyContent: "space-between",
      flexGrow: 1,
      flex: 1,
      paddingBottom: 30,
      // backgroundColor: "#FFFFFF",
    },
    personalDetails: {
      maxHeight: "100%",
    },
    personalDetailsForm: {
      // backgroundColor: "#FFFFFF",
      // paddingVertical: windowWidth > commonConstants.mobileBreak ? 30 : 20,
      paddingHorizontal: windowWidth > commonConstants.mobileBreak ? 30 : 20,
      // borderTopStartRadius: 30,
      // borderTopEndRadius: 30,
      // marginTop: windowWidth > commonConstants.mobileBreak ? 150 : 80,
      position: "relative",
    },
    pageItems: {
      flexDirection: "row",
      maxWidth: commonConstants.maxPageWidth,
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    navList: {
      flexDirection:
        windowWidth > commonConstants.mobileBreak ? "row" : "column",
      justifyContent: "space-between",
    },
    profileImage: {
      // position: "absolute",
      // top: windowWidth > commonConstants.mobileBreak ? -100 : -74,
      zIndex: 2,
      // alignSelf: "center",
    },
    container: {
      paddingHorizontal: 16,
    },
    titleStyle: {
      // marginTop: 90,
    },
    deleteButton: {
      marginTop: -10,
    },
  });
};

export default useStyles;
