import { Dimensions, StyleSheet } from "react-native";
import constants from "src/themes/constants";

import commonConstants from "src/themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    container: {
      paddingLeft: 20,
      width: "100%",
      // height: 100,
      borderRadius: 12,
      backgroundColor: "white",
    },
    reminderText: {
      fontFamily: commonConstants.font400,
      fontSize: 14,
      marginTop: 7,
      paddingRight: 20,
    },
    text: {
      color: commonConstants.black900,
      textTransform: "capitalize",
    },
    icon: {
      height: 24,
      width: 24,
      marginRight: 6,
    },
    iconWithTextContainer: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingRight: 20,
    },
    iconWithText: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    toggleContainer: {
      width: 60,
      height: 40,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: "rgba(0, 122, 255, 0.15)",
      marginRight: 20,
      marginBottom: 20,
      marginTop: 20,
    },
    open: { transform: [{ rotate: "180deg" }] },
    closed: {},
    actionStyle: {
      height: 40,
      width: 40,
      // borderWidth: 1,
      alignItems: "flex-end",
      justifyContent: "center",
      flex: 1,
    },
    expandingSection: {
      overflow: "hidden",
      paddingRight: 20,
    },
    lozengeSelector: {
      width: "100%",
      height: 40,
      borderRadius: constants.radiusXLarge,
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: commonConstants.appBackground,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    day: {
      height: 36,
      width: 36,
      color: commonConstants.white,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: commonConstants.blue900,
      alignItems: "center",
      justifyContent: "center",
    },
    daySelector: {
      paddingTop: 20,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    nav: {
      transform: [{ rotate: "-90deg" }],
    },
    iOSTimePicker: {
      width: "100%",
      marginBottom: 20,
    },
    webTimePicker: {},
    repetitionText: {
      color: commonConstants.black800,
      textTransform: "capitalize",
    },
    lozengeOption: {
      alignItems: "center",
      justifyContent: "center",
      width: 100,
      height: 32,
    },
    lozengeSelected: {
      backgroundColor: commonConstants.blue900,
      borderRadius: commonConstants.radius,
    },
    repetitionTextSelected: {
      color: commonConstants.white,
    },
    dateGridRowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 12,
    },
    dateGrid: {
      flexDirection: "column",
      marginTop: 8,
    },
    dayInGrid: {
      height: 36,
      width: 36,
      color: commonConstants.white,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: commonConstants.blue900,
      alignItems: "center",
      justifyContent: "center",
    },
    formCover: {
      backgroundColor: commonConstants.appBackground,
      width: "100%",
      flexGrow: 1,
      flex: 1,
      height: 170,
    },
  });
};

export default useStyles;
