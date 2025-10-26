import constants from "../constants";

export enum DrawerPosition {
  Left = "left",
  Right = "right",
}

export default {
  selectedNavText: constants.primaryColor,
  navText: constants.black,
  menuItemBackground: constants.white,
  menuItemSelectedBackground: constants.selectedMenuOverlay,
  navbarButtonShadow: constants.shadowSmall,
  drawerLargeScreen: {
    width: 102,
    position: DrawerPosition.Right,
    backgroundColor: constants.appBackground,
    subContainerBackgroundColor: constants.transparent,
    borderRadius: constants.radius,
  },
  drawerSmallScreen: {
    width: 142,
    position: DrawerPosition.Left,
    backgroundColor: constants.white,
    subContainerBackgroundColor: constants.white,
    borderRadius: 0,
  },
};
