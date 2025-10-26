import React from "react";
import { Rect } from "react-native-svg";

const CheckedOutline: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="6"
        fill="white"
        stroke={props?.iconColor}
      />
    </>
  );
};

export default CheckedOutline;
