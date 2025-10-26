import React from "react";
import { Circle } from "react-native-svg";

const CheckedRadioFilled: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Circle
        cx="12"
        cy="12"
        r="11"
        fill="white"
        stroke={props?.iconColor}
        strokeWidth="2"
      />
      <Circle cx="12" cy="12" r="6" fill={props?.iconColor} />
    </>
  );
};

export default CheckedRadioFilled;
