import React from "react";
import { Circle } from "react-native-svg";

const CheckedRadioOutline: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Circle cx="12" cy="12" r="11.5" fill="white" stroke={props?.iconColor} />
    </>
  );
};

export default CheckedRadioOutline;
