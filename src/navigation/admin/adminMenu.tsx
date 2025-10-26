import React, { Fragment, useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { IconTypes } from "src/components/common/icon";
import Icon from "src/components/common/icon";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { isAdmin } from "src/navigation/utils/roleCheck";
import { Typography, TypographyTypes } from "src/components/common/typography";
import constants from "src/themes/navbar/constants";

const useCommonStyles = require("../../themes/navbar/styles/styles").default;

export const AdminMenu = (props: any) => {
  const { roles } = useUserInfo();
  const [selected, setSelected] = useState("Dashboard");
  const commonStyles = useCommonStyles();

  const drawerNavScreens: Array<{
    screen: string;
    icon: IconTypes;
    iconSelected: IconTypes;
    menuText?: string;
  }> = [
    {
      screen: "Dashboard",
      icon: "home-outline",
      iconSelected: "home-filled",
      menuText: "Dashboard",
    },
    {
      screen: "Users",
      icon: "user-edit",
      iconSelected: "home-filled",
      menuText: "Users",
    },
    {
      screen: "Company",
      icon: "leadership-outline",
      iconSelected: "leadership-filled",
      menuText: "Companies",
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

  if (!roles || !isAdmin(roles)) {
    return null;
  }

  return (
    <>
      {drawerNavScreens.map((nav, key) => (
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
              <Icon
                iconType={selected === nav.screen ? nav.iconSelected : nav.icon}
                iconColor={
                  selected === nav.screen
                    ? constants.selectedNavText
                    : constants.navText
                }
                iconSize={20}
              />
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
    </>
  );
};
