/* eslint-disable react-native/no-inline-styles */
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const useCommonStyles =
  require("../../../../themes/webFadeIn/styles/styles").default;

interface WebFaceInProps {
  readonly children: ReactNode;
  readonly style?: Record<string, number | string>;
  readonly off?: boolean;
  readonly shouldWait?: boolean;
  readonly waitFor?: any;
  readonly background?: boolean;
}

export function WebFadeIn({
  children,
  style,
  off,
  shouldWait = false,
  waitFor,
  background = true,
}: WebFaceInProps) {
  const commonStyles = useCommonStyles();
  const [timing, setTiming] = useState<
    Animated.CompositeAnimation | undefined
  >();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      setTiming(
        Animated.timing(fadeAnim, {
          useNativeDriver: true,
          toValue: 1,
          duration: !off ? 200 : 0,
        }),
      );
    }, [fadeAnim, off]),
  );

  useEffect(() => {
    if (shouldWait && waitFor !== undefined && timing) {
      timing.start();
    } else if (timing && !shouldWait) {
      timing.start();
    }
  }, [shouldWait, timing, timing?.start, waitFor]);

  return (
    <Animated.View
      style={[
        commonStyles.container,
        {
          opacity: fadeAnim,
          width: "100%",
        },
        style,
      ]}
      testID="web-fade-in"
    >
      <>{children}</>
    </Animated.View>
  );
}
