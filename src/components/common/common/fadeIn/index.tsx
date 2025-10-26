import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

type Style = Record<string, string | number>;

interface FadeInProps {
  readonly children: ReactNode;
  readonly style?: Style | Style[];
  readonly shouldWait?: boolean;
  readonly waitFor?: number;
}

export function FadeIn({
  children,
  style,
  shouldWait = false,
  waitFor,
}: FadeInProps) {
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
          duration: 400,
        }),
      );
    }, [fadeAnim]),
  );

  useEffect(() => {
    if (shouldWait && waitFor !== undefined && timing) {
      timing.start();
    } else if (timing && !shouldWait) {
      timing.start();
    }
  }, [shouldWait, timing?.start, waitFor]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
