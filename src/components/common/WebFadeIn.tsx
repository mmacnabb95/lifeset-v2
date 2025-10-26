import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface WebFadeInProps {
  children: React.ReactNode;
  background?: boolean;
  style?: any;
}

export const WebFadeIn = ({ 
  children, 
  background = true,
  style 
}: WebFadeInProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View 
      style={[
        styles.container,
        background && styles.background,
        { opacity: fadeAnim },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    backgroundColor: "#FFFFFF",
  },
}); 