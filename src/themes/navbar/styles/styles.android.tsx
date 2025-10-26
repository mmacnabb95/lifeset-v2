import { Dimensions, StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";

import commonConstants from "../../constants";

const useStyles = () => {
  const windowWidth = Dimensions.get("window").width;
  const commonStyles = useCommonStyles();

  const isLandscape = () => {
    const dim = Dimensions.get("window");
    return dim.width >= dim.height;
  };
  const getHeaderHeight = (_windowWidth: number) => {
    if (_windowWidth > commonConstants.avgDeviceSize) {
      return 75;
    }

    if (isLandscape()) {
      return 100;
    }

    return 120;
  };
  return StyleSheet.create({
    drawContainer: {
      ...commonStyles.drawContainer,
    },
    drawerLogoContainer: {
      ...commonStyles.drawerLogoContainer,
    },
    logout: {
      ...commonStyles.logout,
    },
    menuItem: {
      ...commonStyles.menuItem,
    },
    menuItemSelected: {
      ...commonStyles.menuItemSelected,
    },
    webMenuItem: {
      ...commonStyles.webMenuItem,
    },
    webMenuItemLabel: {
      ...commonStyles.webMenuItemLabel,
      height: 26,
    },
    webMenuItemIcon: {
      ...commonStyles.webMenuItemIcon,
    },
    header: {
      ...commonStyles.header,
      top: 54,
      paddingTop: 30,
      height: getHeaderHeight(windowWidth),
    },
    backButton: {
      ...commonStyles.backButton,
    },
    headerLeftColumn: {
      ...commonStyles.headerLeftColumn,
      height: 80,
    },

    headerCenterColumn: {
      ...commonStyles.headerCenterColumn,
      height: 80,
    },
    headerRightColumn: {
      ...commonStyles.headerRightColumn,
    },

    menuButton: {
      ...commonStyles.menuButton,
    },

    logoutButton: {
      ...commonStyles.logoutButton,
    },
  });
};

export default useStyles;
