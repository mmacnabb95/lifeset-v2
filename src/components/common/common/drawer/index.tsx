import React, { useEffect } from "react";
import { View, TouchableOpacity, Animated, Easing } from "react-native";

interface DrawerProps {
  readonly rightItem?: JSX.Element;
  readonly leftItem?: JSX.Element;
  readonly open?: boolean;
  readonly handleClose?: () => void;
}

export const Drawer = ({
  leftItem,
  rightItem,
  open,
  handleClose,
}: DrawerProps) => {
  const [state] = React.useState({
    width: new Animated.Value(0),
  });

  useEffect(() => {
    Animated.timing(state.width, {
      toValue: open ? 1 : 0,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [open]);

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "row",
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      <Animated.View
        style={{
          position: "relative",
          height: "100%",
          width: state.width.interpolate({
            inputRange: [0, 1],
            outputRange: ["100%", "60%"],
          }),
        }}
      >
        {open && (
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0)",
              zIndex: 100,
            }}
            onPress={handleClose}
          />
        )}

        {leftItem}
      </Animated.View>

      <Animated.View
        style={{
          height: "100%",
          width: state.width.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "40%"],
          }),
        }}
      >
        {rightItem}
      </Animated.View>
    </View>
  );
};
