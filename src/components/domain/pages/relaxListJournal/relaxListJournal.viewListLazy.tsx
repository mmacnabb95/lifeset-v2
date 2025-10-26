import React, { lazy, Suspense } from "react";
import { View, Text } from "react-native";
import store from "src/redux/stores/store";
import { invalidateAuth } from "src/redux/features/auth/slice";

//ts-ignore here to allow for auth failure of downloading secure chunk (web only)
//@ts-ignore
const Screen = lazy(() => {
  return import(
    /* webpackChunkName: "cs222rt" */ "src/components/domain/pages/relaxListJournal/relaxListJournal.viewList"
  ).catch(() => {
    store.dispatch(invalidateAuth());
  });
});

//we only want the suspense loading on web as apps already have the compiled code (I think! ...)
//use navigation.web.tsx for seperate version of web implementation
export const LazyRelaxListJournalViewListScreen = ({
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
        <View>
          <Text />
        </View>
      }
    >
      <Screen {...rest} navigation={navigation} route={route} />
    </Suspense>
  );
};
