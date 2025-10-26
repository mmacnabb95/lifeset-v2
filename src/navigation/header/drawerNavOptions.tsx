import { DrawerNavigationOptions } from "@react-navigation/drawer";
import { SetStateAction, useCallback, useLayoutEffect, useState } from "react";
import { Dimensions, Platform, useWindowDimensions } from "react-native";
import { useSelector } from "react-redux";
import { videoPlayerFullScreen } from "src/redux/features/misc/slice";
import { NavProps } from "../types";
import commonConstants from "src/themes/constants";
import navbarConstants, { DrawerPosition } from "src/themes/navbar/constants";
import { useDebouncedCallback } from "use-debounce";
import { useIsSubscribed } from "src/features/subscriptions/hooks/useIsSubscribed";

const windowWidthOnModuleLoad = Dimensions.get("window").width;

export const DrawerNavOptions = ({
  navigation,
}: NavProps): DrawerNavigationOptions => {
  const videoFullScreen = useSelector(videoPlayerFullScreen);
  const { width } = useWindowDimensions();
  const [drawerOpacity, setDrawerOpacity] = useState(1);
  const [drawerWidth, setDrawerWidth] = useState(
    navbarConstants.drawerLargeScreen.width,
  );
  const [_overlayColor, setOverlayColor] = useState<string | undefined>(
    undefined,
  );
  const isLargeScreen = width >= commonConstants.avgDeviceSize;

  const [_drawerPosition, setDrawerPosition] = useState<
    "right" | "left" | undefined
  >(
    isLargeScreen
      ? DrawerPosition.Left
      : navbarConstants.drawerLargeScreen.position,
  );

  //all this hides the drawer on orientation change or web resize------
  const debounced = useDebouncedCallback((_width) => {
    if (_width < commonConstants.avgDeviceSize) {
      setDrawerPosition(DrawerPosition.Right);
      setDrawerWidth(navbarConstants.drawerSmallScreen.width); //we'll need a new width for right
      setTimeout(() => {
        setDrawerOpacity(1);
        setOverlayColor(undefined); //re-instate default overlay  - avoiding screen flicker
      }, 500);
    }
  }, 500);

  useLayoutEffect(() => {
    //width changes the drawer is gone
    setDrawerOpacity(0);
    setDrawerWidth(0);
    setOverlayColor("transparent");
    debounced(width); //only applies if we've gone to a smaller size
    // ...unless we're on a larger screen then it stays in place on the left
    if (width >= commonConstants.avgDeviceSize) {
      setDrawerPosition(DrawerPosition.Left);
      setDrawerOpacity(1);
      setDrawerWidth(navbarConstants.drawerLargeScreen.width);
    }
  }, [debounced, navigation, width]);

  //--------------------------------------------------------------------

  const getDrawerType = () => {
    if (videoFullScreen) {
      return undefined;
    } else if (isLargeScreen) {
      return "permanent";
    } else {
      return "front";
    }
  };

  const isSubscribed = useIsSubscribed();

  return {
    swipeEnabled: isSubscribed === true,
    drawerType: getDrawerType(),
    drawerStyle: {
      width: drawerWidth,
      right: Platform.OS === "web" && !isLargeScreen
        ? 0
        : undefined,
      backgroundColor: isLargeScreen
        ? navbarConstants.drawerLargeScreen.backgroundColor
        : navbarConstants.drawerSmallScreen.backgroundColor,
      opacity: drawerOpacity,
    },
    headerShown: videoFullScreen,
    drawerPosition: _drawerPosition,
    headerStyle: {
      height: 0,
    },
    headerLeft: () => false,
    headerLeftLabelVisible: false,
    headerTitle: "",
    headerShadowVisible: false,
    headerTransparent: false,
    drawerContentStyle: {
      backgroundColor: navbarConstants.drawerLargeScreen.backgroundColor,
    },
    overlayColor: 'rgba(0,0,0,0.5)',
  };
};
