import { Dimensions, StyleSheet } from "react-native";
import constants from "src/themes/constants";

import commonConstants from "src/themes/constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    // Scroll View
    scrollViewContainer: {
      width: "100%",
      flex: 1, //this disables croll
    },
    scrollViewBody: {
      width: windowWidth - 40,
      flexGrow: 1,
    },
    headerPageCompensation: {
      paddingTop: 120,
    },
    scrollPageCompensation: {
      paddingBottom: 60,
    },

    // Auth Page Styles
    authPage: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      alignSelf: "center",
      padding: 20,
      flexGrow: 1,
      width: "100%",
      maxWidth: 400,
      paddingTop: 120,
    },
    imageContainer: {
      marginTop: 50,
      marginBottom: 20,
    },
    authAction: {
      marginTop: 16,
      marginBottom: 30,
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    authPageLogo: {
      width: 100,
      height: 100,
    },
    authTitle: {
      // marginTop: 92,
      marginBottom: 14,
    },
    authPreamble: {
      marginBottom: 14,
    },

    // Dashboard
    tileContainer: {
      marginTop: 20,
      flex: 1,
      flexWrap: "wrap",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    pageItems: {
      flexDirection: "row",
      maxWidth: commonConstants.maxPageWidth,
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    paddingMob20: {
      paddingLeft: windowWidth > commonConstants.avgDeviceSize ? 10 : 20,
      paddingRight: 20,
    },

    // Common Styles
    page: {
      flexDirection: "column",
      flexGrow: 1,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      marginLeft: windowWidth > commonConstants.mobileBreak ? "auto" : 0,
      marginRight: windowWidth > commonConstants.mobileBreak ? "auto" : 0,
      paddingHorizontal: windowWidth > commonConstants.mobileBreak ? 40 : 20,
      maxHeight: "100%",
      maxWidth:
        windowWidth >= commonConstants.maxPageWidth
          ? commonConstants.maxPageWidth
          : undefined,
      width: "100%",
      paddingTop: 120,
    },
    pageTitle: {
      marginBottom: 30,
      alignSelf: "flex-start",
      color: constants.primaryColor,
    },
    pagePreamble: {
      marginBottom: 44,
      alignSelf: "flex-start",
      color: constants.black900,
    },
    forgottenPassword: {
      alignSelf: "flex-start",
    },
    link: {
      color: constants.primaryColor,
    },
    authImageContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    spacedButton: {
      marginTop: 10,
      width: "100%",
    },
    noMobPadding: {
      paddingHorizontal: 0,
      // paddingTop: 0,
    },

    row: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },

    //List
    navOptionsListOnly: {
      flexDirection: "row",
      justifyContent:
        windowWidth > commonConstants.mobileBreak
          ? "flex-start"
          : "space-between",
      alignItems: "flex-start",
    },

    fullScreenPage: {
      position: "absolute",
      height: "100%",
      width: "100%",
      alignItems:
        windowWidth > commonConstants.mobileBreak ? "flex-start" : "center",
      justifyContent: "flex-start",
      padding: 0,
      paddingRight: 0,
      paddingTop: 0,
      backgroundColor: "green",
    },
    fullScreenWithUploadViewer: {
      flexDirection: "column",
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      marginLeft: windowWidth > commonConstants.mobileBreak ? "auto" : 0,
      marginRight: windowWidth > commonConstants.mobileBreak ? "auto" : 0,
      paddingTop: 0,
      maxWidth: commonConstants.avgDeviceSize,
      width: windowWidth > commonConstants.mobileBreak ? "100%" : undefined,
    },
    largePageBody: {
      maxWidth:
        windowWidth > commonConstants.avgDeviceSize
          ? commonConstants.avgDeviceSize
          : windowWidth > commonConstants.mobileBreak
          ? commonConstants.maxPageWidth
          : undefined,
    },
    itemPage: {
      zIndex: 999,
      borderWidth: 0,
      paddingVertical: windowWidth > commonConstants.mobileBreak ? 0 : 30,
      paddingHorizontal: windowWidth > commonConstants.mobileBreak ? 0 : 20,
      paddingTop: 0,
    },
    itemPageHeader: {
      backgroundColor: "#ffffff",
      marginTop: -38,
      borderTopStartRadius: 30,
      borderTopEndRadius: 30,
      paddingHorizontal: windowWidth > commonConstants.mobileBreak ? 100 : 20,
      paddingTop: windowWidth > commonConstants.mobileBreak ? 0 : 30,
    },
    subList: {
      // height: "100%",
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    searchSection: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      paddingHorizontal: 0,
    },
    searchFilterButton: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: 50,
      height: 50,
      minHeight: 0,
      padding: 0,
      backgroundColor: constants.primaryColor,
      borderWidth: 0,
      borderRadius: 12,
      marginLeft: 6,
      paddingTop: 4,
      paddingLeft: 4,
    },
  });
};

export default useStyles;
