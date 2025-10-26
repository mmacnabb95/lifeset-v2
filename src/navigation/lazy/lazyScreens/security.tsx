import React, { lazy, Suspense } from "react";
import { View, Text } from "react-native";
import store from "src/redux/stores/store";
import { invalidateAuth } from "src/redux/features/auth/slice";



//ts-ignore here to allow for auth failure of downloading secure chunk (web only)
//@ts-ignore
const Screen = lazy(() => {
  //looks like cookies are the only way to pass auth with lazy loaded chunks

  return import(
    /* webpackChunkName: "cs222rt" */ "src/pages/settings/security/security"
  ).catch(() => {
    store.dispatch(invalidateAuth());
  });
});

export const LazySecurity = ({ navigation }: { navigation: any }) => {
  return (
    <Suspense
      fallback={
        <View>
          <Text />
        </View>
      }
    >
      <Screen navigation={navigation} />
    </Suspense>
  );
};
