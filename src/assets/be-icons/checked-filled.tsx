import React from "react";
import { Path, Rect } from "react-native-svg";

const CheckedFilled: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Rect width="22" height="22" rx="6" fill={props?.iconColor} />
      <Path
        d="M7 10.5671L10.2432 13.8103L16.0534 8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
};

export default CheckedFilled;
