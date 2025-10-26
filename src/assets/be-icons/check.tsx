import React from "react";
import { Path } from "react-native-svg";

const Check: React.FunctionComponent<{
  iconColor?: string;
}> = (props) => {
  return (
    <>
      <Path
        d="M1 3.5671L4.24317 6.81027L10.0534 1"
        stroke={props?.iconColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
};

export default Check;
