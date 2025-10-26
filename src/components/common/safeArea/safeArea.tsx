import React, { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import commonConstants from "src/themes/constants";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

// https://reactnavigation.org/docs/handling-safe-area/

export const SafeArea = ({
  children,
  authed,
}: {
  children: ReactNode;
  authed?: boolean;
}) => {
  const layoutStyles = useLayoutStyles();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          paddingTop: authed ? 0 : insets.top,
          paddingBottom: authed ? 0 : insets.bottom,
          backgroundColor: authed
            ? commonConstants.transparent
            : commonConstants.transparent,
        },
        layoutStyles.safeArea,
      ]}
    >
      {children}
    </View>
  );
};
