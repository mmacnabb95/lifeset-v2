import { Dimensions, StyleSheet } from "react-native";
import useCommonStyles from "./common.styles";
import commonConstants from "../../constants";

const useStyles = () => {
  const commonStyles = useCommonStyles();
  const windowWidth = Dimensions.get("window").width;
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

    return 120;
  };
  return StyleSheet.create({
    drawContainer: {
      ...commonStyles.drawContainer,
      marginTop: 30,
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
    webMenuItem: {
      ...commonStyles.webMenuItem,
    },
    menuItemSelected: {
      ...commonStyles.menuItemSelected,
    },
    webMenuItemLabel: {
      ...commonStyles.webMenuItemLabel,
      height: 23,
    },
    webMenuItemIcon: {
      ...commonStyles.webMenuItemIcon,
    },
    header: {
      ...commonStyles.header,
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
      height: 80,
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
