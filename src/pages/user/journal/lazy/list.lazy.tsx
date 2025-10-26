import React, { lazy, Suspense } from "react";
import { View } from "react-native";
import store from "src/redux/stores/store";
import { invalidateAuth } from "src/redux/features/auth/slice";

const Screen = lazy(() => 
  import("../list").then(module => ({ default: module.default }))
  .catch(() => {
    store.dispatch(invalidateAuth());
    return { default: () => <View /> };
  })
);

export const LazyMyMindsetJournalListScreen = ({
  navigation,
  route,
  ...rest
}: {
  navigation: any;
  route: any;
  [key: string]: any;
}) => {
  return (
    <Suspense fallback={<View />}>
      <Screen navigation={navigation} route={route} {...rest} />
    </Suspense>
  );
};
