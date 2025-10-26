import React, { Fragment, useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import Icon, { IconTypes } from "src/components/common/icon";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import {
  isAdmin,
  isCompanyManager,
  isUser,
} from "src/navigation/utils/roleCheck";
import { Typography, TypographyTypes } from "src/components/common/typography";
import constants from "src/themes/navbar/constants";
import { PngIcon } from "src/components/common/pngIcon/pngIcon";
import { AuthModal } from "src/features/subscriptions/components/authModal/authModal";
import { useSelector } from "react-redux";
import { showAuthModal } from "src/redux/features/misc/slice";

const useCommonStyles = require("../../themes/navbar/styles/styles").default;

export const UserMenu = (props: any) => {
  const { roles } = useUserInfo();
  const [selected, setSelected] = useState("Habits");
  const commonStyles = useCommonStyles();
  const _showAuthModal = useSelector(showAuthModal);

  const drawerNavScreens: Array<{
    screen: string;
    icon?: IconTypes;
    pngIcon?: string;
    iconSelected?: IconTypes;
    menuText?: string;
  }> = [
    {
      screen: "Welcome",
      icon: "home-outline",
      iconSelected: "home-outline",
      menuText: "Dashboard",
    },
    {
      screen: "Habits",
      icon: "apps-outline",
      iconSelected: "apps-outline",
      menuText: "Habits",
    },
    {
      screen: "UserHabitPackEditList",
      icon: "habit-packs",
      iconSelected: "habit-packs",
      menuText: "Habit packs",
    },
    {
      screen: "UserWorkoutEdit",
      pngIcon: "dumbell",
      menuText: "Workouts",
    },
    {
      screen: "Journal",
      icon: "book-outline",
      iconSelected: "book-outline",
      menuText: "Journal",
    },
    {
      screen: "Nutrition",
      pngIcon: "diet",
      menuText: "Nutrition",
    },
    {
      screen: "CommunityForum",
      icon: "leadership-outline",
      iconSelected: "leadership-filled",
      menuText: "Community",
    },
    { screen: "Settings", icon: "gear-outline", iconSelected: "gear-filled" },
  ];

  useEffect(() => {
    let screenName = "";

    if (props?.state && !props.largeScreen) {
      screenName =
        props?.state?.routes[0].state?.routes[
          props?.state?.routes[0].state?.routes?.length - 1
        ].name;

      if (
        screenName &&
        selected !== screenName &&
        drawerNavScreens.map((item) => item.screen).indexOf(screenName) !== -1
      ) {
        setSelected(screenName);
      }
    } else if (props?.route) {
      screenName = props?.route?.params?.screen || props?.route?.name;
    }

    if (
      screenName &&
      selected !== screenName &&
      drawerNavScreens.map((item) => item.screen).indexOf(screenName) !== -1
    ) {
      setSelected(screenName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.state?.routes, selected]);

  if (!roles || !isUser(roles) || isCompanyManager(roles)) {
    return null;
  }

  return (
    <>
      {drawerNavScreens
        .filter(nav => nav.screen !== "UserHabitPackEditList")
        .map((nav, key) => (
        <Fragment key={key}>
          <Pressable
            testID={"menu-button-" + nav.screen}
            onPress={() =>
              props.navigation.navigate("Main", { screen: nav.screen })
            }
            style={[
              commonStyles.webMenuItem,
              selected === nav.screen ? commonStyles.menuItemSelected : {},
            ]}
          >
            <View style={commonStyles.webMenuItemIcon}>
              {!!nav.icon && !!nav.iconSelected && (
                <Icon
                  iconType={
                    selected === nav.screen ? nav.iconSelected : nav.icon
                  }
                  iconColor={
                    selected === nav.screen
                      ? constants.selectedNavText
                      : constants.navText
                  }
                  iconSize={20}
                />
              )}
              {!!nav.pngIcon && (
                <PngIcon iconName={nav.pngIcon} height={20} width={20} />
              )}
            </View>
            <View>
              <Typography
                type={TypographyTypes.MenuText}
                style={[
                  commonStyles.webMenuItemLabel,
                  {
                    color:
                      selected === nav.screen
                        ? constants.selectedNavText
                        : constants.navText,
                  },
                ]}
                text={nav?.menuText || nav.screen}
              />
            </View>
          </Pressable>
        </Fragment>
      ))}
      {_showAuthModal && <AuthModal />}
    </>
  );
};
