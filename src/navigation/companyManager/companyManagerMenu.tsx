import React, { Fragment, useEffect, useState } from "react";
import { View, Pressable, Platform } from "react-native";
import { IconTypes } from "src/components/common/icon";
import Icon from "src/components/common/icon";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import {
  isAdmin,
  isCompanyManager,
  isUser,
} from "src/navigation/utils/roleCheck";
import { Typography, TypographyTypes } from "src/components/common/typography";
import constants from "src/themes/navbar/constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import _ from "lodash";
import { PngIcon } from "src/components/common/pngIcon/pngIcon";

const useCommonStyles = require("../../themes/navbar/styles/styles").default;

export const CompanyManagerMenu = (props: any) => {
  const { roles, companyId } = useUserInfo();
  const [selected, setSelected] = useState("Habits");
  const commonStyles = useCommonStyles();

  const drawerNavScreens: Array<{
    screen: string;
    icon?: IconTypes;
    pngIcon?: string;
    iconSelected?: IconTypes;
    menuText?: string;
  }> = [
    {
      screen: "CompanyDashboard",
      icon: "user-edit",
      iconSelected: "user-edit",
      menuText: "Management",
    },
    {
      screen: "CompanyUser",
      icon: "leadership-outline",
      iconSelected: "leadership-filled",
      menuText: "Users",
    },
  ];

  if (Platform.OS !== "web" || process.env.ENV === "CI") {
    drawerNavScreens.splice(0, 0, {
      screen: "Welcome",
      icon: "home-outline",
      iconSelected: "home-filled",
      menuText: "Dashboard",
    });
    drawerNavScreens.push({
      screen: "Habits",
      icon: "apps-outline",
      iconSelected: "apps-outline",
      menuText: "Habits",
    });
    drawerNavScreens.push({
      screen: "UserHabitPackEditList",
      icon: "habit-packs",
      iconSelected: "habit-packs",
      menuText: "Habit packs",
    });
    drawerNavScreens.push({
      screen: "UserWorkoutEdit",
      pngIcon: "dumbell",
      menuText: "Workouts",
    });
  }

  drawerNavScreens.push({
    screen: "Settings",
    icon: "gear-outline",
    iconSelected: "gear-filled",
  });

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

  if (!roles || !isCompanyManager(roles)) {
    return null;
  }

  return (
    <>
      {drawerNavScreens.map((nav, key) => (
        <Fragment key={key}>
          <Pressable
            testID={"menu-button-" + nav.screen}
            onPress={() =>
              props.navigation.navigate("Main", {
                screen: nav.screen,
                params: { companyId: companyId },
              })
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
                testID={nav?.menuText}
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
    </>
  );
};
