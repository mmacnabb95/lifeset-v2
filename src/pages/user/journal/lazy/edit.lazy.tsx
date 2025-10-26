import React, { lazy, Suspense } from "react";
import { View } from "react-native";
import store from "src/redux/stores/store";
import { invalidateAuth } from "src/redux/features/auth/slice";

const Screen = lazy(() => 
  import("../edit").then(module => ({ default: module.default }))
  .catch(() => {
    store.dispatch(invalidateAuth());
    // Return a default component to prevent crash
    return { default: () => <View /> };
  })
);

export const LazyJournalEditScreen = ({
  navigation,
  route,
  ...rest
}: {
  navigation: any;
  route: any;
  [key: string]: any;
}) => {
  return (
    <Suspense
      fallback={
        <View />
      }
    >
      <Screen {...rest} navigation={navigation} route={route} />
    </Suspense>
  );
}; 