import React, { lazy, Suspense } from "react";
import { View, Text } from "react-native";
import store from "src/redux/stores/store";
import { invalidateAuth } from "src/redux/features/auth/slice";

//Note this is no longer used as it breaks platform specific extensions... however it remains here as we would like it to work for web
// https://reactnative.dev/docs/platform-specific-code#native-specific-extensions-ie-sharing-code-with-nodejs-and-web

//ts-ignore here to allow for auth failure of downloading secure chunk (web only)
//@ts-ignore
const Screen = lazy(() => {
  return import(
    /* webpackChunkName: "cs222rt" */ "src/pages/subscription/subscription"
  ).catch(() => {
    store.dispatch(invalidateAuth());
  });
});

//we only want the suspense loading on web as apps already have the compiled code (I think! ...)
//use navigation.web.tsx for seperate version of web implementation
export const LazySubscriptionScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  return (
    <Suspense
      fallback={
        <View>
          <Text />
        </View>
      }
    >
      <Screen navigation={navigation} route={route} />
    </Suspense>
  );
};
