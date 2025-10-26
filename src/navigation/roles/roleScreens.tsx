import React, { Fragment, useEffect } from "react";
import { View, Text, Platform } from "react-native";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { AdminScreens } from "../admin/adminScreens";
import { UserScreens } from "../user/userScreens";
import { isAdmin, isCompanyManager } from "../utils/roleCheck";
import { CompanyManagerScreens } from "../companyManager/companyManagerScreens";
import _ from "lodash";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Loading } from "src/components/common/loading/loading";
import { AuthScreens } from "../auth/authScreens";
import { getSubscriptionViews } from "src/features/subscriptions/redux/domain/features/subscriptionView/collection-slice";
import { useDispatch } from "react-redux";


export const RoleScreens = ({
  Drawer,
  RootStack,
}: {
  Drawer: any;
  RootStack: any;
}) => {
  const { roles, companyId, userId } = useUserInfo();
  const dispatch = useDispatch();

  useEffect(() => {
    if (userId) {
      dispatch(getSubscriptionViews({ user: userId }));
    }
  }, [dispatch, userId]);

  // Debugging: Ensure these functions return valid JSX
  console.log("AdminScreens:", AdminScreens({ Drawer, RootStack }));
  console.log("UserScreens:", UserScreens({ Drawer, RootStack }));
  console.log("CompanyManagerScreens:", CompanyManagerScreens({ Drawer, RootStack }));
  console.log("AuthScreens:", AuthScreens({ Navigator: RootStack }));

  if (isAdmin(roles)) {
    return AdminScreens({ Drawer, RootStack });
  } else if (isCompanyManager(roles)) {
    const userScreens = UserScreens({ Drawer, RootStack });
    const companyManagerScreens = CompanyManagerScreens({ Drawer, RootStack });
    const authScreens = AuthScreens({ Navigator: RootStack });

    return (
      <>
        {(Platform.OS !== "web" || process.env.ENV === "CI") && (
          <Drawer.Group>{userScreens || <View />}</Drawer.Group>
        )}
        <Drawer.Group>{companyManagerScreens || <View />}</Drawer.Group>
        <Drawer.Group>{authScreens || <View />}</Drawer.Group>
      </>
    );
  } else {
    const userScreens = UserScreens({ Drawer, RootStack });
    const authScreens = AuthScreens({ Navigator: RootStack });

    return (
      <>
        <Drawer.Group>{userScreens || <View />}</Drawer.Group>
        <Drawer.Group>{authScreens || <View />}</Drawer.Group>
      </>
    );
  }
};
