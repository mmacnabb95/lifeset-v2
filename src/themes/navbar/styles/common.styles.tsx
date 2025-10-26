import { Dimensions, StyleSheet } from "react-native";
import { TypographyTypes } from "../../../components/common/typography";
import constants from "../constants";
import commonConstants from "../../constants";
import navbarConstants from "../../../themes/navbar/constants";

const useTypographyStyles = require("../../typography/styles/styles").default;

const useStyles = () => {
  const typographyStyles = useTypographyStyles();

  const windowWidth = Dimensions.get("window").width;
  const isLargeScreen = windowWidth >= commonConstants.avgDeviceSize;

  const headerLeftRightColWidth =
    windowWidth > commonConstants.avgDeviceSize ? 120 : 60;

  const menuBarMaxWidth = (windowWidth: number) => {
    if (
      windowWidth - headerLeftRightColWidth * 2 >
      commonConstants.maxPageWidth
    ) {
      return commonConstants.maxPageWidth;
    } else if (
      windowWidth > commonConstants.maxPageWidth &&
      windowWidth <
        commonConstants.maxPageWidth + headerLeftRightColWidth * 2 &&
      windowWidth < commonConstants.avgDeviceSize
    ) {
      return windowWidth - headerLeftRightColWidth * 3;
    } else if (
      windowWidth > commonConstants.maxPageWidth &&
      windowWidth <
        commonConstants.maxPageWidth + headerLeftRightColWidth * 2 &&
      windowWidth > commonConstants.avgDeviceSize
    ) {
      return windowWidth - headerLeftRightColWidth * 2;
    } else if (windowWidth < commonConstants.maxPageWidth) {
      return windowWidth - headerLeftRightColWidth * 2;
    }

    return undefined;
  };

  const isLandscape = () => {
    const dim = Dimensions.get("window");
    return dim.width >= dim.height;
  };

  const getHeaderHeight = (_windowWidth: number) => {
    if (_windowWidth > commonConstants.avgDeviceSize) {
      return 75;
    }

    if (isLandscape()) {
      return 80;
    }

    return 80;
  };

  return StyleSheet.create({
    header: {
      height: getHeaderHeight(windowWidth),
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingTop: 0,
      minHeight: 55,
    },
    headerLeftColumn: {
      marginLeft: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 0,
      height: "100%",
    },
    headerCenterColumn: {
      marginLeft: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 0,
      height: "100%",
      maxWidth: 200,
    },
    headerRightColumn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 0,
      height: "100%",
      // borderWidth: 1,
    },
    backButton: {
      borderWidth: 0,
      borderRadius: 12,
      width: 50,
      minHeight: 44,
      backgroundColor: "transparent",
      shadowColor: commonConstants.transparent,
    },

    drawContainer: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
      padding: isLargeScreen ? 10 : 0,
      marginHorizontal: 10,
      marginVertical: 10,
      backgroundColor: isLargeScreen
        ? constants.drawerLargeScreen.subContainerBackgroundColor
        : constants.drawerSmallScreen.subContainerBackgroundColor,
      borderRadius: isLargeScreen
        ? navbarConstants.drawerLargeScreen.borderRadius
        : 0,
    },
    drawerLogoContainer: {
      marginTop: 40,
      alignItems: "center",
      justifyContent: "flex-start",
      marginBottom: 120,
    },
    logout: {
      ...typographyStyles[TypographyTypes.Body1],
      marginBottom: 20,
      marginHorizontal: 0,
      alignItems: "center",
      justifyContent: "flex-end",
      height: 50,
    },
    menuItem: {
      ...typographyStyles[TypographyTypes.Body2],
      backgroundColor: constants.menuItemBackground,
    },
    menuItemSelected: {
      backgroundColor: constants.menuItemSelectedBackground,
    },
    webMenuItem: {
      display: "flex",
      flexDirection: isLargeScreen ? "column" : "row",
      alignItems: "center",
      justifyContent: isLargeScreen ? "center" : "flex-start",
      borderRadius: commonConstants.radius,
      marginLeft: 5,
      marginBottom: isLargeScreen ? 40 : 0,
      height: 60,
    },
    webMenuItemLabel: {
      height: 20,
      marginLeft: isLargeScreen ? 0 : 10,
      // borderWidth: 1,
    },
    webMenuItemIcon: {
      marginBottom: 4,
    },
    menuButton: {
      backgroundColor: "transparent", //"rgba(255,255,255, 0.5)",
      marginRight: 10,
      marginLeft: 20,
      width: 100,
      minWidth: 50,
      elevation: 0,
      // ...commonConstants.shadowLarge,
    },

    logoutButton: {
      marginRight: windowWidth > commonConstants.avgDeviceSize ? 20 : 0,
    },
  });
};

export default useStyles;
