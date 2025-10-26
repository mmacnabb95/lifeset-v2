import { ParamListBase } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { AdminMenu } from "../admin/adminMenu";
import { UserMenu } from "../user/userMenu";

const StaticWebHeader: React.FunctionComponent<{
  navigation: StackNavigationProp<ParamListBase>;
  route: any;
}> = (props) => {
  const state = props?.navigation?.getState();

  return (
    <>
      <AdminMenu {...props} state={state} largeScreen />
      <UserMenu {...props} state={state} largeScreen />
    </>
  );
};

export default StaticWebHeader;
