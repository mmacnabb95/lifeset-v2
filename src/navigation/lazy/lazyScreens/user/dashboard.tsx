import React, { lazy, Suspense } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import store from "src/redux/stores/store";
import { invalidateAuth } from "src/redux/features/auth/slice";

// Try a different approach for lazy loading
const Screen = lazy(() => 
  import("src/pages/user/dashboard/dashboard")
    .then(module => ({ default: module.default || module }))
    .catch(() => {
      store.dispatch(invalidateAuth());
      // Return a placeholder component when the import fails
      return { 
        default: () => <View><Text>Failed to load dashboard</Text></View> 
      };
    })
);

//we only want the suspense loading on web as apps already have the compiled code (I think! ...)
//use navigation.web.tsx for seperate version of web implementation
export const LazyUserDashboardScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      }
    >
      <Screen navigation={navigation} route={route} />
    </Suspense>
  );
};
