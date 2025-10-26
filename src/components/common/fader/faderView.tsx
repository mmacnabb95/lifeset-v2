import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export const FaderView = ({
  children,
  visible,
  style,
  duration = 200,
  testID,
}: {
  children: ReactNode;
  visible: boolean;
  style?: any;
  duration?: number;
  testID?: string;
}) => {
  const [timing, setTiming] = useState<
    Animated.CompositeAnimation | undefined
  >();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setTiming(
        Animated.timing(fadeAnim, {
          useNativeDriver: true,
          toValue: 1,
          duration: duration,
        }),
      );
    } else {
      setTiming(
        Animated.timing(fadeAnim, {
          useNativeDriver: true,
          toValue: 0,
          duration: duration,
        }),
      );
    }
  }, [duration, fadeAnim, visible]);

  useEffect(() => {
    timing?.start();
  }, [timing]);

  return (
    <Animated.View
      testID={testID}
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
