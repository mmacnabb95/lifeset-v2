import React from "react";
import { View } from "react-native";

import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { useDispatch } from "react-redux";
import { setForceNav } from "src/redux/features/misc/slice";
import { CommonActions } from "@react-navigation/native";
import { Button, ButtonTypes } from "./index";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

const useFormStyles = require("../../../themes/form/styles/styles").default;

var platform = require("platform");

export const AppOrWebLoginButtons = ({ navigation }: { navigation: any }) => {
  const authStyles = useLayoutStyles();
  const formStyles = useFormStyles;

  const { userId } = useUserInfo();
  const dispatch = useDispatch();

  return (
    <View style={[formStyles.fieldContainer, authStyles.spacedButton]}>
      <Button
        onPress={() => {
          // Note this does not work with expo go web client - openURL seems to refresh the page
          // this does work, however with the built version of the code i.e. as served by express
          // todo: remove temp store redirect in favor of deep link into store ?
          var now = new Date().valueOf();
          setTimeout(function () {
            if (new Date().valueOf() - now > 3000) {
              return;
            }
            const os = platform.os.toString();
            if (
              os.toLowerCase().indexOf("mac") !== -1 ||
              os.toLowerCase().indexOf("os x") !== -1 ||
              os.toLowerCase().indexOf("osx") !== -1 ||
              os.toLowerCase().indexOf("ios") !== -1
            ) {
              // Linking.openURL("https://www.apple.com/uk/app-store/");
              // Linking.openURL(`${process.env.GET_APP_LINK_IOS}`);
              window.location.assign(`${process.env.GET_APP_LINK_IOS}`);
            } else {
              // Linking.openURL("https://play.google.com/store/apps");
              // Linking.openURL(`${process.env.GET_APP_LINK_ANDROID}`);
              window.location.assign(`${process.env.GET_APP_LINK_ANDROID}`);
            }
          }, 2000); //even with this 2s delay the store is shown - this was a temp solution anyway so leaving for now pending real link -> store -> open app option?
          // Linking.openURL(`${process.env.APP_DEEP_LINK_BASE}`);
          window.location.assign(`${process.env.APP_DEEP_LINK_BASE}`);
        }}
        testID={"AppLogin"}
        title={"Open the app"}
        style={{ marginBottom: 20 }}
      />
      {/* <Text>{process.env.APP_DEEP_LINK_BASE}/--/Login</Text>
        <Text>{Linking.makeUrl("Login")}</Text> */}
      {userId ? (
        <Button
          onPress={() => {
            dispatch(setForceNav(true));
            const resetAction = CommonActions.reset({
              index: 0,
              routes: [{ name: "Main", params: { screen: "PersonalDetails" } }],
            });
            navigation.dispatch(resetAction);
          }}
          testID={"ReturnToWebsite"}
          title={"Return to site"}
          type={ButtonTypes.Secondary}
        />
      ) : (
        <Button
          onPress={() => {
            navigation.navigate("Login");
          }}
          testID={"WebLogin"}
          title={"Web log in"}
          type={ButtonTypes.Secondary}
        />
      )}
    </View>
  );
};
