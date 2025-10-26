import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  background?: boolean;
  style?: ViewStyle;
}

export const WebFadeIn: React.FC<Props> = ({ children, background = true, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    const startAnimation = () => {
      animation = Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      });
      animation.start();
    };

    startAnimation();

    return () => {
      if (animation) {
        animation.stop();
      }
      fadeAnim.setValue(0);
    };
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          flex: 1,
          backgroundColor: background ? '#fff' : 'transparent',
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}; 