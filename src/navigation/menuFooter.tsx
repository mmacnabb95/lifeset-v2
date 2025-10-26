import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import React, { useState } from "react";
import { Pressable, View, Image, Linking, Platform } from "react-native";
import { useDispatch } from "react-redux";
import { invalidateAuth } from "src/redux/features/auth/slice";
import { AdminMenu } from "./admin/adminMenu";
import { UserMenu } from "./user/userMenu";
// import { useLogoutWorkaround } from "./utils/useLogoutWorkAround";
import { Modal, Typography } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { CompanyManagerMenu } from "./companyManager/companyManagerMenu";
import { Button, ButtonTypes } from "src/components/common/button";
import constants from "src/themes/constants";
import { MadeByHardingScottMenuItem } from "src/features/madeByHardingScott/components/menuItem/madeByHardingScottMenuItem";
import { navigationRef } from "./rootNavigation";
import { CommonActions } from "@react-navigation/native";

const useCommonStyles = require("../themes/navbar/styles/styles").default;

export const CustomDrawerContent = (props: any) => {
  const commonStyles = useCommonStyles();
  const dispatch = useDispatch();
  // We'll no longer use this, comment it out for now 
  // const { resetNav } = useLogoutWorkaround(props);

  return (
    <>
      <DrawerContentScrollView
        {...props}
        bounces={false}
        contentContainerStyle={commonStyles.drawContainer}
      >
        <View>
          <View style={commonStyles.drawerLogoContainer}>
            <Image
              style={{ height: 73, width: 73 }}
              source={require("../../assets/lifeset-icon.png")}
            />
          </View>
          <DrawerItemList {...props} />
          <AdminMenu {...props} />
          <UserMenu {...props} />
          <CompanyManagerMenu {...props} />
        </View>
        <View>
          <Pressable
            style={commonStyles.logout}
            testID="user-logout-web-button"
            onPress={async () => {
              try {
                // Clear auth state and wait for it to complete
                await dispatch(invalidateAuth());
                
                // Reset app state
                dispatch({ type: "RESET_APP" });
                
                // Let the auth system handle navigation instead of trying to navigate directly
                // This way we don't need to know the exact route names
              } catch (error) {
                console.error('Logout failed:', error);
              }
            }}
          >
            <Typography type={TypographyTypes.MenuText} text={"Logout"} />
          </Pressable>
          <MadeByHardingScottMenuItem />
        </View>
      </DrawerContentScrollView>
    </>
  );
};
