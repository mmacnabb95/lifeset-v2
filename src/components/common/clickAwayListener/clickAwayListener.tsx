import React, { FC, RefObject } from "react";
import { View, ViewProps, GestureResponderEvent } from "react-native";

interface OutsideViewProps extends ViewProps {
  childRef: RefObject<any>;

  onPressOutside?: () => void;
}

const isTapInsideComponent = (target: any, nestedViewRef: any): boolean => {
  if (
    target &&
    nestedViewRef &&
    target._nativeTag === nestedViewRef._nativeTag
  ) {
    return true;
  }

  if (nestedViewRef._children && nestedViewRef._children.length > 0) {
    for (let index = 0; index <= nestedViewRef._children.length - 1; index++) {
      if (isTapInsideComponent(target, nestedViewRef._children[index])) {
        return true;
      }
    }
  }

  return false;
};

const OutsideView: FC<OutsideViewProps> = ({
  childRef,
  onPressOutside,
  onStartShouldSetResponder,
  ...rest
}) => (
  <View
    {...rest}
    onStartShouldSetResponder={(evt: GestureResponderEvent) => {
      console.log("onStartShouldSetResponder", evt);
      evt.persist();

      // if press outside, execute onPressOutside callback
      if (
        onPressOutside &&
        childRef &&
        !isTapInsideComponent(evt.target, childRef.current || childRef)
      ) {
        onPressOutside();
      }

      // return onStartShouldSetResponder in case it is passed to OutsideView
      return onStartShouldSetResponder?.(evt) ?? true;
    }}
  />
);

export default OutsideView;
