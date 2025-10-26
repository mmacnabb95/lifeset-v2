import React from "react";
import { Circle } from "react-native-svg";

const Dots: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Circle
        cx="12"
        cy="20"
        r="2"
        transform="rotate(-90 12 20)"
        fill={props?.iconColor}
      />
      <Circle
        cx="12"
        cy="12"
        r="2"
        transform="rotate(-90 12 12)"
        fill={props?.iconColor}
      />
      <Circle
        cx="12"
        cy="4"
        r="2"
        transform="rotate(-90 12 4)"
        fill={props?.iconColor}
      />
    </>
  );
};

export default Dots;
