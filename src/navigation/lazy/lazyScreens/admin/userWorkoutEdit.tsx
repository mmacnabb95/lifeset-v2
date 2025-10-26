import React, { lazy, Suspense } from "react";
import { View, Text } from "react-native";
import store from "src/redux/stores/store";
import { invalidateAuth } from "src/redux/features/auth/slice";



//ts-ignore here to allow for auth failure of downloading secure chunk (web only)
//@ts-ignore
const Screen = lazy(() => {
  //looks like cookies are the only way to pass auth with lazy loaded chunks

  return import(
    /* webpackChunkName: "cs222rt" */ "src/pages/admin/userWorkouts/userWorkoutEdit"
  ).catch(() => {
    store.dispatch(invalidateAuth());
  });
});

//we only want the suspense loading on web as apps already have the compiled code (I think! ...)
//use navigation.web.tsx for seperate version of web implementation
export const LazyUserWorkoutEditScreen = ({
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
